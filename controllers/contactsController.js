const Joi = require('joi');
const Contact = require('../models/contactModel');

const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    favorite: Joi.boolean().required(),
});

const listContacts = async (req, res) => {
    try {
        const currentUser = req.user;
        const query = { owner: currentUser._id };

        const contacts = await Contact.find(query).populate('owner', 'email');

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getById = async (req, res) => {
    try {
        const currentUser = req.user;
        const contactId = req.params.id;

        const contact = await Contact.findOne({ _id: contactId, owner: currentUser._id });

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json({ contact });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const addContact = async (req, res) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { name, email, phone, favorite } = req.body;

        const newContact = await Contact.create({
            name,
            email,
            phone,
            favorite,
            owner: currentUser._id,
        });

        currentUser.contacts.push(newContact._id);
        await currentUser.save();

        res.status(201).json({ contact: newContact });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
