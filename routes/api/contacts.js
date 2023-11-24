const express = require('express');
const router = express.Router();
const {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
  contactSchema,
} = require('..//../controllers/contactsController');

router.get('/', async (req, res) => {
  const contacts = await listContacts();
  res.status(200).json(Array.isArray(contacts) ? contacts : [contacts]);
});

router.get('/:id', async (req, res) => {
  const contact = await getById(req.params.id);

  if (contact) {
    res.json(contact);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone } = req.body;

  const { error } = contactSchema.validate({ name, email, phone });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const result = await addContact({ name, email, phone });
  res.status(201).json(result);
});

router.delete('/:id', async (req, res) => {
  const result = await removeContact(req.params.id);

  res.json(result);
});

router.put('/:id', async (req, res) => {
  const { name, email, phone } = req.body;

  const { error } = contactSchema.validate({ name, email, phone });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (!name && !email && !phone) {
    return res.status(400).json({ message: 'missing fields' });
  }

  const result = await updateContact(req.params.id, {
    name,
    email,
    phone,
  });

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

module.exports = router;
