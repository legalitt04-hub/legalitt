const fs = require('fs');
const content = fs.readFileSync('src/controllers/authController.js', 'utf8');

const updated = content.replace(
  'const user = await User.findOne({ email: email.toLowerCase() }).select(\'+password\');',
  `const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    console.log('Login attempt for:', email);
    console.log('User found:', !!user);
    console.log('User has password:', !!user?.password);`
).replace(
  'const isMatch = await user.comparePassword(password);',
  `const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);`
);

fs.writeFileSync('src/controllers/authController.js', updated);
console.log('✅ Logging added to authController');
