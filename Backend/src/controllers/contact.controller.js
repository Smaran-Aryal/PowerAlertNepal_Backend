const { sendContactEmail } = require("../utils/email");

const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      const error = new Error("Name, email, and message are all required");
      error.statusCode = 400;
      throw error;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error("Please provide a valid email address");
      error.statusCode = 400;
      throw error;
    }

    if (message.trim().length < 10) {
      const error = new Error("Message must be at least 10 characters");
      error.statusCode = 400;
      throw error;
    }

    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactForm };