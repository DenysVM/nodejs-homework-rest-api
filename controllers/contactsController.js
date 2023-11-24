const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const contactsPath = path.join(process.cwd(), 'contacts.json');
const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
});

const listContacts = async () => {
    const data = await fs.readFile(contactsPath, 'utf-8');
    return JSON.parse(data);
};

const getById = async (contactId) => {
    const contacts = await listContacts();
    const contact = contacts.find((c) => c.id === contactId);
    return contact;
};

const addContact = async (newContact) => {
    const { error } = contactSchema.validate(newContact);
    if (error) {
        throw new Error(error.details[0].message);
    }

    const contacts = await listContacts();

    const newId = uuidv4();

    const updatedContact = { id: newId, ...newContact };
    const updatedContacts = Array.isArray(contacts) ? [...contacts, updatedContact] : [updatedContact];

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
    return updatedContact;
};

const removeContact = async (contactId) => {
    const contacts = await listContacts();
    const updatedContacts = contacts.filter((c) => c.id !== contactId);

    if (contacts.length === updatedContacts.length) {
        return { message: 'Not found' };
    }

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
    return { message: 'contact deleted' };
};


const updateContact = async (contactId, updatedFields) => {
    const { error } = contactSchema.validate(updatedFields);
    if (error) {
        throw new Error(error.details[0].message);
    }

    const contacts = await listContacts();
    const updatedContacts = contacts.map((c) =>
        c.id === contactId ? { ...c, ...updatedFields } : c
    );

    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
    return getById(contactId);
};

module.exports = { listContacts, getById, addContact, removeContact, updateContact, contactSchema };
