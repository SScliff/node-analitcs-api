const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { validate } = require('../middlewares/validate.middleware');
const { ticketSchema } = require('../schemas/ticket.schema');

router.post('/', validate(ticketSchema), ticketController.create);
router.get('/', ticketController.findAll);
router.get('/:id', ticketController.findOne);
router.patch('/:id', ticketController.update);
router.delete('/:id', ticketController.delete);

module.exports = router;
