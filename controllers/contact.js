const { sendContactEmail } = require('../utils/mailer');
const Contact = require('../models/contact');


const sendMessage = async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    // Server-side validation
    if (!firstName || firstName.length > 20) {
        return res.status(400).json({ message: 'Invalid first name' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }
    if (phone && !/^\d{4}-\d{7}$/.test(phone)) {
        return res.status(400).json({ message: 'Phone must be in format xxxx-xxxxxxx (11 digits)' });
    }
    if (!message || message.length < 30 || message.length > 500) {
        return res.status(400).json({ message: 'Invalid message length' });
    }

    try {
        // Save to MongoDB
        const contact = new Contact({
            firstName,
            lastName,
            email,
            phone,
            message
        });
        await contact.save();


        sendContactEmail({
            firstName,
            lastName,
            email,
            phone,
            message
        })

        res.status(200).json({ message: 'Message sent and saved successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to process request' });
    }
};

module.exports = { sendMessage };