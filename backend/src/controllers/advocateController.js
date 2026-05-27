const Advocate = require('../models/Advocate');
const User = require('../models/User');

// Get all advocates with filters and search
exports.getAdvocates = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, specialization, city,
      minFee, maxFee, minRating, sortBy = 'rating',
      search,
    } = req.query;

    const filter = { isVerified: true, verificationStatus: 'approved' };
    
    if (search) {
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      filter.user = { $in: userIds };
    }
    
    if (specialization) filter.specializations = specialization;
    if (city) filter['location.address.city'] = new RegExp(city, 'i');
    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
    }
    if (minRating) filter['rating.average'] = { $gte: Number(minRating) };

    const sortMap = {
      rating: { 'rating.average': -1 },
      fee_asc: { consultationFee: 1 },
      fee_desc: { consultationFee: -1 },
      experience: { experience: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.rating;

    const skip = (Number(page) - 1) * Number(limit);
    const [advocates, total] = await Promise.all([
      Advocate.find(filter)
        .populate('user', 'name avatar isActive')
        .sort(sort).skip(skip).limit(Number(limit)).lean(),
      Advocate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: advocates,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        hasMore: (Number(page) * Number(limit)) < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get nearby advocates - FIXED FOR ATLAS WITH PAGINATION
exports.getNearby = async (req, res, next) => {
  try {
    const { 
      lat, 
      lng, 
      radius = 10, 
      limit = 50,
      page = 1,
      specialization,
      minRating,
      maxFee
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    const maxResults = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const skip = (pageNum - 1) * maxResults;

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
      });
    }

    const radiusMeters = radiusKm * 1000;

    console.log(`📍 Nearby query: lat=${latitude}, lng=${longitude}, radius=${radiusKm}km, page=${pageNum}`);

    // Get limit+1 to check if there are more (can't use countDocuments with $nearSphere on Atlas)
    const advocates = await Advocate.find({
      isVerified: true,
      verificationStatus: 'approved',
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
    })
      .populate('user', 'name avatar isActive')
      .skip(skip)
      .limit(maxResults + 1)
      .lean();

    const hasMore = advocates.length > maxResults;
    const results = hasMore ? advocates.slice(0, maxResults) : advocates;
    
    console.log(`✅ Found ${results.length} advocates on page ${pageNum}, hasMore: ${hasMore}`);

    // Apply additional filters
    let filteredResults = results;
    if (specialization) {
      filteredResults = filteredResults.filter(adv => 
        adv.specializations && adv.specializations.includes(specialization)
      );
    }
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      filteredResults = filteredResults.filter(adv => 
        adv.rating?.average >= minRatingNum
      );
    }
    if (maxFee) {
      const maxFeeNum = parseFloat(maxFee);
      filteredResults = filteredResults.filter(adv => 
        adv.consultationFee <= maxFeeNum
      );
    }
    // Calculate distances
    const advocatesWithDistance = filteredResults.map(advocate => {
      const [advLng, advLat] = advocate.location.coordinates;
      
      const R = 6371;
      const dLat = toRad(advLat - latitude);
      const dLon = toRad(advLng - longitude);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latitude)) * Math.cos(toRad(advLat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return {
        ...advocate,
        distance: Math.round(distance * 100) / 100,
        distanceMeters: Math.round(distance * 1000),
      };
    });

    res.json({
      success: true,
      data: advocatesWithDistance,
      pagination: {
        page: pageNum,
        limit: maxResults,
        hasMore: hasMore,
      },
      resultsCount: advocatesWithDistance.length,
    });
  } catch (error) {
    console.error('❌ Nearby query error:', error.message);
    next(error);
  }
};

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

exports.getAdvocateById = async (req, res, next) => {
  try {
    let advocate = await Advocate.findById(req.params.id)
      .populate('user', 'name email avatar phone isActive')
      .lean();

    if (!advocate) {
      // Fallback: Check if the provided ID is a User ID
      advocate = await Advocate.findOne({ user: req.params.id })
        .populate('user', 'name email avatar phone isActive')
        .lean();
    }

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate not found',
      });
    }

    res.json({
      success: true,
      data: advocate,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.user;
    delete updates.isVerified;
    delete updates.verificationStatus;

    const advocate = await Advocate.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar');

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate profile not found',
      });
    }

    res.json({
      success: true,
      data: advocate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

exports.getAdvocate = exports.getAdvocateById;

exports.getSpecializations = async (req, res, next) => {
  try {
    const specializations = [
      'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law',
      'Property Law', 'Tax Law', 'Labour Law', 'Cyber Law',
      'Consumer Law', 'Banking Law', 'Constitutional Law',
      'Environmental Law', 'Immigration Law', 'Intellectual Property',
    ];
    
    res.json({
      success: true,
      data: specializations,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    const cities = await Advocate.distinct('location.address.city');
    
    res.json({
      success: true,
      data: cities.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const advocate = await Advocate.findOne({ user: req.user.id })
      .populate('user', 'name email avatar phone')
      .lean();

    if (!advocate) {
      return res.status(404).json({
        success: false,
        message: 'Advocate profile not found',
      });
    }

    res.json({
      success: true,
      data: advocate,
    });
  } catch (error) {
    next(error);
  }
};

exports.upsertProfile = async (req, res, next) => {
  try {
    const { name, phone, ...rest } = req.body;
    
    // Update User model fields persistently
    if (name || phone) {
      const user = await User.findById(req.user.id);
      if (user) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        await user.save();
      }
    }

    const profileData = { ...rest, user: req.user.id };
    
    const advocate = await Advocate.findOneAndUpdate(
      { user: req.user.id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    res.json({
      success: true,
      data: advocate,
    });
  } catch (error) {
    next(error);
  }
};
