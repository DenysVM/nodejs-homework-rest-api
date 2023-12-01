const express = require('express');
const router = express.Router();
const {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact,
  contactSchema,
  updateStatusContact,
} = require('..//../controllers/contactsController');

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts(req, res, next);
    res.status(200).json(Array.isArray(contacts) ? contacts : [contacts]);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const contact = await getById(req.params.id);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, phone, favorite } = req.body;

  const { error } = contactSchema.validate({ name, email, phone, favorite });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const result = await addContact(req, res);
  res.status(201).json(result);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await removeContact(id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Contact not found') {
      res.status(404).json({ message: 'Not found' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

router.put('/:id', async (req, res) => {
  const { name, email, phone, favorite } = req.body;

  const { error } = contactSchema.validate({ name, email, phone, favorite });
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
    favorite,
  });

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

router.patch('/:contactId/favorite', (req, res) => {
  const contactId = req.params.contactId;
  const body = req.body;

  updateStatusContact(contactId, body)
    .then((updatedContact) => res.json(updatedContact))
    .catch((error) => {
      if (error.message === 'missing field favorite') {
        res.status(400).json({ message: 'missing field favorite' });
      } else if (error.message === 'Not found') {
        res.status(404).json({ message: 'Not found' });
      } else {
        res.status(500).json({ message: error.message });
      }
    });
});

module.exports = router;
