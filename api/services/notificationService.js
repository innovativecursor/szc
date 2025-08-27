const AWS = require("aws-sdk");
const { loadConfig } = require("../config/configLoader");

// Load configuration
const config = loadConfig();

// Configure AWS SES
const configureSES = () => {
  const sesConfig = {
    region: config.storage.object_storage.region,
    accessKeyId: config.storage.object_storage.access_key_id,
    secretAccessKey: config.storage.object_storage.secret_access_key,
  };

  if (config.storage.object_storage.endpoint) {
    sesConfig.endpoint = config.storage.object_storage.endpoint;
  }

  return new AWS.SES(sesConfig);
};

// Send brief notification to tag followers
const sendBriefNotification = async (followers, brief, tag) => {
  try {
    const ses = configureSES();

    for (const follower of followers) {
      const emailParams = {
        Source:
          config.storage.object_storage.from_email ||
          "noreply@skillzcollab.com",
        Destination: {
          ToAddresses: [follower.email],
        },
        Message: {
          Subject: {
            Data: `New Brief Alert: ${brief.title}`,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: generateBriefNotificationHTML(follower, brief, tag),
              Charset: "UTF-8",
            },
            Text: {
              Data: generateBriefNotificationText(follower, brief, tag),
              Charset: "UTF-8",
            },
          },
        },
      };

      await ses.sendEmail(emailParams).promise();
    }

    return {
      success: true,
      message: `Notifications sent to ${followers.length} followers`,
    };
  } catch (error) {
    console.error("Error sending brief notifications:", error);
    throw new Error("Failed to send notifications");
  }
};

// Generate HTML email body for brief notification
const generateBriefNotificationHTML = (follower, brief, tag) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Brief Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .brief-card { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .tag-badge { display: inline-block; background: #28a745; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Brief Alert</h1>
          <p>Hello ${follower.displayName || follower.username}!</p>
        </div>
        
        <div class="content">
          <p>A new brief has been posted for a tag you're following!</p>
          
          <div class="brief-card">
            <h2>${brief.title}</h2>
            <p><strong>Tag:</strong> <span class="tag-badge">${
              tag.name
            }</span></p>
            ${
              brief.description
                ? `<p><strong>Description:</strong> ${brief.description}</p>`
                : ""
            }
            ${
              brief.isPaid
                ? `<p><strong>Prize Amount:</strong> $${brief.prizeAmount}</p>`
                : ""
            }
            ${
              brief.submissionDeadline
                ? `<p><strong>Submission Deadline:</strong> ${new Date(
                    brief.submissionDeadline
                  ).toLocaleDateString()}</p>`
                : ""
            }
          </div>
          
          <a href="${
            config.server.base_url || "http://localhost:8080"
          }/briefs/${brief.id}" class="cta-button">
            View Brief Details
          </a>
          
          <p>Don't miss this opportunity! Check out the brief and submit your creative work.</p>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you're following the "${
            tag.name
          }" tag on SkillzCollab.</p>
          <p>© 2024 SkillzCollab. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate plain text email body for brief notification
const generateBriefNotificationText = (follower, brief, tag) => {
  return `
New Brief Alert

Hello ${follower.displayName || follower.username}!

A new brief has been posted for a tag you're following!

Brief: ${brief.title}
Tag: ${tag.name}
${brief.description ? `Description: ${brief.description}` : ""}
${brief.isPaid ? `Prize Amount: $${brief.prizeAmount}` : ""}
${
  brief.submissionDeadline
    ? `Submission Deadline: ${new Date(
        brief.submissionDeadline
      ).toLocaleDateString()}`
    : ""
}

View the brief at: ${
    config.server.base_url || "http://localhost:8080"
  }/briefs/${brief.id}

Don't miss this opportunity! Check out the brief and submit your creative work.

You're receiving this email because you're following the "${
    tag.name
  }" tag on SkillzCollab.

© 2024 SkillzCollab. All rights reserved.
  `;
};

// Send welcome email to new users
const sendWelcomeEmail = async (user) => {
  try {
    const ses = configureSES();

    const emailParams = {
      Source:
        config.storage.object_storage.from_email || "noreply@skillzcollab.com",
      Destination: {
        ToAddresses: [user.email],
      },
      Message: {
        Subject: {
          Data: "Welcome to SkillzCollab!",
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: generateWelcomeEmailHTML(user),
            Charset: "UTF-8",
          },
          Text: {
            Data: generateWelcomeEmailText(user),
            Charset: "UTF-8",
          },
        },
      },
    };

    await ses.sendEmail(emailParams).promise();

    return { success: true, message: "Welcome email sent successfully" };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

// Generate HTML email body for welcome email
const generateWelcomeEmailHTML = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SkillzCollab</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
        .welcome-message { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to SkillzCollab!</h1>
          <p>We're excited to have you on board!</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <h2>Hello ${user.displayName || user.username}!</h2>
            <p>Welcome to SkillzCollab, the platform where creativity meets opportunity!</p>
            
            <p>Here's what you can do on SkillzCollab:</p>
            <ul>
              <li>📝 Create and manage your portfolio</li>
              <li>🏷️ Follow tags that interest you</li>
              <li>💼 Submit work for creative briefs</li>
              <li>🏆 Win prizes and recognition</li>
              <li>🤝 Connect with other creatives</li>
            </ul>
          </div>
          
          <a href="${
            config.server.base_url || "http://localhost:8080"
          }/dashboard" class="cta-button">
            Get Started
          </a>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 SkillzCollab. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate plain text email body for welcome email
const generateWelcomeEmailText = (user) => {
  return `
Welcome to SkillzCollab!

Hello ${user.displayName || user.username}!

Welcome to SkillzCollab, the platform where creativity meets opportunity!

Here's what you can do on SkillzCollab:
- Create and manage your portfolio
- Follow tags that interest you
- Submit work for creative briefs
- Win prizes and recognition
- Connect with other creatives

Get started at: ${config.server.base_url || "http://localhost:8080"}/dashboard

If you have any questions, feel free to reach out to our support team.

© 2024 SkillzCollab. All rights reserved.
  `;
};

// Verify email address
const verifyEmail = async (email) => {
  try {
    const ses = configureSES();

    const params = {
      EmailAddress: email,
    };

    const result = await ses.verifyEmailIdentity(params).promise();

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("Error verifying email:", error);
    throw new Error("Failed to verify email");
  }
};

// Get sending statistics
const getSendingStats = async () => {
  try {
    const ses = configureSES();

    const params = {
      StartDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      EndDate: new Date(),
    };

    const result = await ses.getSendStatistics(params).promise();

    return {
      success: true,
      data: result.SendDataPoints,
    };
  } catch (error) {
    console.error("Error getting sending stats:", error);
    throw new Error("Failed to get sending statistics");
  }
};

// Send custom notification
const sendCustomNotification = async (
  recipients,
  subject,
  htmlContent,
  textContent
) => {
  try {
    const ses = configureSES();

    const emailParams = {
      Source:
        config.storage.object_storage.from_email || "noreply@skillzcollab.com",
      Destination: {
        ToAddresses: Array.isArray(recipients) ? recipients : [recipients],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: "UTF-8",
          },
          Text: {
            Data: textContent,
            Charset: "UTF-8",
          },
        },
      },
    };

    await ses.sendEmail(emailParams).promise();

    return { success: true, message: "Custom notification sent successfully" };
  } catch (error) {
    console.error("Error sending custom notification:", error);
    throw new Error("Failed to send custom notification");
  }
};

module.exports = {
  sendBriefNotification,
  generateBriefNotificationHTML,
  generateBriefNotificationText,
  sendWelcomeEmail,
  generateWelcomeEmailHTML,
  generateWelcomeEmailText,
  verifyEmail,
  getSendingStats,
  sendCustomNotification,
};
