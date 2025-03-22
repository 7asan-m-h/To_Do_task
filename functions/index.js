const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

exports.sendTaskReminder = functions.firestore
  .document("tasks/{taskId}")
  .onUpdate(async (change, context) => {
    const task = change.after.data();
    const { assignedTo, title, dueDate, reminderSent } = task;

    if (reminderSent) return;

    const mailOptions = {
      from: "your-email@gmail.com",
      to: assignedTo.join(","),
      subject: `Reminder: Task "${title}" is due soon`,
      text: `Your task "${title}" is due on ${new Date(dueDate.toDate()).toLocaleDateString()}.`,
    };

    await transporter.sendMail(mailOptions);
    await change.after.ref.update({ reminderSent: true });
  });
