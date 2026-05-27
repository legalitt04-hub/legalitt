const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/caseController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.route('/')
  .post(ctrl.createCase)
  .get(ctrl.getCases);

router.route('/:id')
  .get(ctrl.getCase)
  .patch(ctrl.updateCase);

router.post('/:id/timeline', ctrl.addTimelineEvent);
router.post('/:id/notes', ctrl.addCaseNote);
router.post('/:id/documents', ctrl.addCaseDocument);

module.exports = router;
