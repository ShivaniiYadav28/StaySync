const Notification =
  require("../models/Notification");


const createNotification = async ({
  recipient,
  type,
  title,
  message,
  property = null,
  inquiry = null,
  review = null,
}) => {

  try {

    if (!recipient) {

      return null;

    }


    const notification =
      await Notification.create({

        recipient,

        type,

        title,

        message,

        property,

        inquiry,

        review,

      });


    return notification;

  } catch (error) {

    console.error(
      "Create notification error:",
      error
    );

    return null;

  }

};


module.exports = {
  createNotification,
};