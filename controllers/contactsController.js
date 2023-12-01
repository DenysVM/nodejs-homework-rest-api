const Joi = require('joi');
const Contact = require('../models/contactModel');

const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    favorite: Joi.boolean().required(),
});

const listContacts = async () => {
    const contacts = await Contact.find();
    return contacts;
};

const getById = async (id) => {
    return Contact.findById(id);
};

const addContact = async (req, res, next) => {
    const { name, email, phone, favorite } = req.body;

    try {
        const newContact = await Contact.create({ name, email, phone, favorite });
        res.status(201).json(newContact);
    } catch (error) {
        next(error);
    }
};

const removeContact = async (id) => {
    if (!id) {
        throw new Error('Contact ID is missing');
    }

    const result = await Contact.findByIdAndDelete(id);

    if (!result) {
        throw new Error('Contact not found');
    }

    return { message: 'Contact deleted' };
};

const updateContact = async (id, updatedFields) => {
    if (!id) {
        throw new Error('Contact ID is missing');
    }

    try {
        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            throw new Error('Contact not found');
        }

        return updatedContact;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new Error('Validation error. Please check your input data.');
        }

        throw error;
    }
};

const updateStatusContact = (contactId, body) => {
    if (!body || typeof body.favorite === 'undefined') {
        return Promise.reject(new Error('missing field favorite'));
    }

    return Contact.findByIdAndUpdate(
        contactId,
        { favorite: body.favorite },
        { new: true, runValidators: true }
    )
        .then((updatedContact) => {
            if (!updatedContact) {
                return Promise.reject(new Error('Not found'));
            }
            return updatedContact;
        })
        .catch((error) => {
            if (error.name === 'ValidationError') {
                return Promise.reject(new Error('Validation error'));
            }
            return Promise.reject(error);
        });
};

module.exports = {
    listContacts,
    getById,
    addContact,
    removeContact,
    updateContact,
    contactSchema,
    updateStatusContact,
};
