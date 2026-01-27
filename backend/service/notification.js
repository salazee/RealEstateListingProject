const Notification = require("../model/notification");
const sendEmail = require("../service/emailService");
const { sendNotification } = require("../service/socket");

/**
 * Notify user via:
 * 1. In-app notification (DB)
 * 2. Email
 * 3. Real-time socket
 *
 * @param {Object|String} user - user object or userId
 * @param {String} title
 * @param {String} message
 */
const notifyUser = async (user, title, message) => {
  try {
    const userId = user?._id || user;
    const email = user?.email;

    // 1️⃣ Save in-app notification
    await Notification.create({
      user: userId,
      title,
      message
    });

    // 2️⃣ Send email (optional)
    if (email) {
      await sendEmail(email, title, message);
    }

    // 3️⃣ Real-time socket notification
    sendNotification(userId, { title, message });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = { notifyUser };

