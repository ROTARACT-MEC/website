import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

async function getActiveSubscribers(strapi: any) {
  const activeSubscribers = await strapi.documents('api::subscriber.subscriber').findMany({
    filters: { active: true },
  });
  return activeSubscribers || [];
}

function createTransporter() {
  console.log('[Newsletter] Creating SMTP transporter...');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function verifySMTP(transporter: any) {
  try {
    console.log('[Newsletter] Verifying SMTP connection...');
    await transporter.verify();
    console.log('[Newsletter] SMTP verification succeeded');
  } catch (verifyError) {
    console.error('[Newsletter] SMTP verification failed:', verifyError);
    throw verifyError;
  }
}

function getLogoAttachments() {
  const logoPath = path.resolve(process.cwd(), '../public/821BEB28-B6DD-4E85-A1EF-C60BA699FE9B.PNG');
  const attachments: any[] = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: 'logo.png',
      path: logoPath,
      cid: 'logo',
    });
  }
  return attachments;
}

async function sendEmails(
  transporter: any,
  activeSubscribers: any[],
  subject: string,
  htmlContent: string,
  attachments: any[]
) {
  const senderEmail = process.env.SMTP_FROM || 'snigdhasudheesh662@gmail.com';
  for (const subscriber of activeSubscribers) {
    try {
      console.log("[Newsletter] Sender Email:", senderEmail);
      console.log("[Newsletter] Sending TO:", subscriber.email);

      await transporter.sendMail({
        from: `"Rotaract Club MEC" <${senderEmail}>`,
        to: subscriber.email,
        subject,
        html: htmlContent,
        attachments,
      });
      console.log(`[Newsletter] Email sent successfully to: ${subscriber.email}`);
    } catch (err: any) {
      console.error(`[Newsletter] Failed email with full error for ${subscriber.email}:`, err);
    }
  }
}

async function sendBlogNewsletter(strapi: any, documentId: string) {
  try {
    console.log(`[Newsletter] Starting newsletter dispatch process for blog ID: ${documentId}`);

    // Fetch the fully populated blog (including coverImage)
    const blog = await strapi.documents('api::blog.blog').findOne({
      documentId,
      populate: ['coverImage'],
    });

    if (!blog) {
      console.warn(`[Newsletter] Published blog document with ID ${documentId} not found.`);
      return;
    }
    console.log(`[Newsletter] Blog fetched successfully: "${blog.title}"`);

    if (blog.subscribersNotified) {
      console.log(`[Newsletter] Newsletter already sent for blog: ${blog.title}`);
      return;
    }

    // Fetch active subscribers
    const activeSubscribers = await getActiveSubscribers(strapi);
    const activeCount = activeSubscribers.length;
    console.log(`[Newsletter] Active subscribers found: ${activeCount}`);

    if (activeCount === 0) {
      console.log('[Newsletter] No active subscribers found. Marking blog as notified.');
      await strapi.documents('api::blog.blog').update({
        documentId,
        data: { subscribersNotified: true },
      });
      return;
    }

    const transporter = createTransporter();
    await verifySMTP(transporter);

    const attachments = getLogoAttachments();

    // Resolve Cover Image URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:1337';
    let coverImageUrl = '';
    if (blog.coverImage) {
      const url = blog.coverImage.url || (blog.coverImage.data && blog.coverImage.data.attributes && blog.coverImage.data.attributes.url);
      if (url) {
        coverImageUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
      }
    }

    const coverImageHtml = coverImageUrl
      ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${coverImageUrl}" alt="Blog Cover" style="width: 100%; max-height: 300px; object-fit: cover; display: block; border-radius: 8px;"></div>`
      : '';

    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:5173';
    const blogLink = `${websiteUrl}/blog/${blog.documentId}`;

    const title = blog.title || '';
    const excerpt = blog.excerpt || '';

    // Branded HTML email layout
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Blog Post: ${title}</title>
  <style>
    body {
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      background-color: #FFF6FA;
      color: #475569;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px -10px rgba(217, 27, 92, 0.15);
      border: 1px solid #FFF0F6;
    }
    .header {
      background-color: #0F172A;
      padding: 24px;
      text-align: center;
    }
    .header img {
      height: 44px;
      vertical-align: middle;
    }
    .header-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      vertical-align: middle;
      margin-left: 12px;
      letter-spacing: 1px;
      display: inline-block;
    }
    .content {
      padding: 32px;
    }
    h1 {
      color: #0F172A;
      font-size: 24px;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .excerpt {
      font-size: 16px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }
    .cta-container {
      text-align: center;
      margin-bottom: 8px;
    }
    .cta-button {
      background-color: #D91B5C;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      display: inline-block;
      font-size: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      line-height: 1.5;
    }
    .footer a {
      color: #D91B5C;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:logo" alt="Rotaract MEC Logo">
      <span class="header-text">ROTARACT MEC</span>
    </div>
    <div class="content">
      ${coverImageHtml}
      <h1>${title}</h1>
      <p class="excerpt">${excerpt}</p>
      <div class="cta-container">
        <a href="${blogLink}" class="cta-button" target="_blank">Read Full Article</a>
      </div>
    </div>
    <div class="footer">
      <p>You received this because you subscribed to the Rotaract MEC blog updates.</p>
      <p>&copy; ${new Date().getFullYear()} Rotaract Club of Model Engineering College. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log(`[Newsletter] Sending blog email to active subscribers...`);
    await sendEmails(transporter, activeSubscribers, `New Blog Post: ${blog.title}`, htmlContent, attachments);

    // Update blog to prevent duplicate mailings
    await strapi.documents('api::blog.blog').update({
      documentId,
      data: {
        subscribersNotified: true,
      },
    });
    console.log(`[Newsletter] Blog updated with subscribersNotified=true for ID: ${documentId}`);
  } catch (err: any) {
    console.error(`[Newsletter] Error during blog newsletter dispatch process:`, err);
  }
}

async function sendEventNewsletter(strapi: any, documentId: string) {
  try {
    console.log(`[Newsletter] Starting event newsletter dispatch process for event ID: ${documentId}`);

    // Fetch the fully populated event (including image)
    const event = await strapi.documents('api::event.event').findOne({
      documentId,
      populate: ['image'],
    });

    if (!event) {
      console.warn(`[Newsletter] Published event document with ID ${documentId} not found.`);
      return;
    }
    console.log(`[Newsletter] Event fetched successfully: "${event.title}"`);

    if (event.subscribersNotified) {
      console.log(`[Newsletter] Newsletter already sent for event: ${event.title}`);
      return;
    }

    // Fetch active subscribers
    const activeSubscribers = await getActiveSubscribers(strapi);
    const activeCount = activeSubscribers.length;
    console.log(`[Newsletter] Active subscribers found: ${activeCount}`);

    if (activeCount === 0) {
      console.log('[Newsletter] No active subscribers found. Marking event as notified.');
      await strapi.documents('api::event.event').update({
        documentId,
        data: { subscribersNotified: true },
      });
      return;
    }

    const transporter = createTransporter();
    await verifySMTP(transporter);

    const attachments = getLogoAttachments();

    // Resolve Cover Image URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:1337';
    let coverImageUrl = '';
    if (event.image) {
      const url = event.image.url || (event.image.data && event.image.data.attributes && event.image.data.attributes.url);
      if (url) {
        coverImageUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;
      }
    }

    const coverImageHtml = coverImageUrl
      ? `<div style="text-align: center; margin-bottom: 24px;"><img src="${coverImageUrl}" alt="Event Cover" style="width: 100%; max-height: 300px; object-fit: cover; display: block; border-radius: 8px;"></div>`
      : '';

    const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:5173';
    const eventLink = `${websiteUrl}/events/${event.documentId}`;

    let formattedDate = '';
    if (event.date) {
      try {
        formattedDate = new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch (e) {
        formattedDate = event.date;
      }
    }
    const eventDateTime = formattedDate ? (event.time ? `${formattedDate} at ${event.time}` : formattedDate) : (event.time || 'To Be Announced');

    const title = event.title || '';
    const description = event.description || '';

    // Branded HTML email layout
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upcoming Event: ${title}</title>
  <style>
    body {
      font-family: 'Inter', Helvetica, Arial, sans-serif;
      background-color: #FFF6FA;
      color: #475569;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px -10px rgba(217, 27, 92, 0.15);
      border: 1px solid #FFF0F6;
    }
    .header {
      background-color: #0F172A;
      padding: 24px;
      text-align: center;
    }
    .header img {
      height: 44px;
      vertical-align: middle;
    }
    .header-text {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      vertical-align: middle;
      margin-left: 12px;
      letter-spacing: 1px;
      display: inline-block;
    }
    .content {
      padding: 32px;
    }
    h1 {
      color: #0F172A;
      font-size: 24px;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .details-box {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #FFF0F6;
      border-radius: 12px;
      border: 1px solid #FFF0F6;
      font-size: 15px;
    }
    .details-line {
      margin: 0;
      color: #475569;
      line-height: 1.6;
    }
    .description {
      font-size: 16px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }
    .cta-container {
      text-align: center;
      margin-bottom: 8px;
    }
    .cta-button {
      background-color: #D91B5C;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 600;
      display: inline-block;
      font-size: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      line-height: 1.5;
    }
    .footer a {
      color: #D91B5C;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="cid:logo" alt="Rotaract MEC Logo">
      <span class="header-text">ROTARACT MEC</span>
    </div>
    <div class="content">
      ${coverImageHtml}
      <h1>${title}</h1>
      
      <div class="details-box">
        <p class="details-line"><strong>📅 Date & Time:</strong> ${eventDateTime}</p>
        <p class="details-line" style="margin-top: 8px;"><strong>📍 Location:</strong> ${event.location || 'To Be Announced'}</p>
      </div>

      <p class="description">${description}</p>
      
      <div class="cta-container">
        <a href="${eventLink}" class="cta-button" target="_blank">View Event</a>
      </div>
    </div>
    <div class="footer">
      <p>You received this because you subscribed to the Rotaract MEC newsletter updates.</p>
      <p>&copy; ${new Date().getFullYear()} Rotaract Club of Model Engineering College. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log(`[Newsletter] Sending event email to active subscribers...`);
    await sendEmails(transporter, activeSubscribers, `Upcoming Event: ${event.title}`, htmlContent, attachments);

    // Update event to prevent duplicate mailings
    await strapi.documents('api::event.event').update({
      documentId,
      data: {
        subscribersNotified: true,
      },
    });
    console.log(`[Newsletter] Event updated with subscribersNotified=true for ID: ${documentId}`);
  } catch (err: any) {
    console.error(`[Newsletter] Error during event newsletter dispatch process:`, err);
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: any }) {
    strapi.documents.use(async (context, next) => {
      const isPublishingBlog = context.action === 'publish' && context.uid === 'api::blog.blog';
      const isPublishingEvent = context.action === 'publish' && context.uid === 'api::event.event';
      const documentId = context.params?.documentId;

      // 1. Intercept subscriber create to set subscribedAt automatically
      if (context.action === 'create' && context.uid === 'api::subscriber.subscriber') {
        if (context.params && context.params.data) {
          context.params.data.subscribedAt = new Date();
        }
      }

      // Execute the operation
      const result = await next();

      // 2. Intercept blog publish action to dispatch newsletter
      if (isPublishingBlog && documentId) {
        console.log(`[Newsletter] Blog publish detected for ID: ${documentId}. Scheduling newsletter task...`);
        setTimeout(() => {
          sendBlogNewsletter(strapi, documentId).catch((err) => {
            console.error('[Newsletter] Scheduled blog newsletter task failed:', err);
          });
        }, 0);
      }

      // 3. Intercept event publish action to dispatch newsletter
      if (isPublishingEvent && documentId) {
        console.log(`[Newsletter] Event publish detected for ID: ${documentId}. Scheduling newsletter task...`);
        setTimeout(() => {
          sendEventNewsletter(strapi, documentId).catch((err) => {
            console.error('[Newsletter] Scheduled event newsletter task failed:', err);
          });
        }, 0);
      }

      return result;
    });
  },


  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      const existingCoords = await strapi.documents('api::coordinator.coordinator').findMany();
      const needsCoordMigration = existingCoords.length === 0 || !existingCoords.some(c => typeof c.image === 'string' && c.image.startsWith('/coordinators/'));

      if (needsCoordMigration) {
        console.log('--- Resetting and re-seeding coordinators with static paths ---');
        for (const c of existingCoords) {
          await strapi.documents('api::coordinator.coordinator').delete({
            documentId: c.documentId
          });
        }

        const coordinatorsData = [
          {
            name: 'Minu K K',
            role: 'Faculty incharge',
            instagram: '',
            linkedin: 'https://www.linkedin.com/in/minu-k-k-a7167456/',
            image: '/coordinators/minu-k-k.jpeg'
          },
          {
            name: 'Abheerav A Nambiar',
            role: 'Charter President',
            instagram: 'https://www.instagram.com/abheerav_a_nambiar/',
            linkedin: 'https://www.linkedin.com/in/abheerav-anil-a97757328?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/abheerav-a-nambiar.pdf'
          },
          {
            name: 'John Bethlehem Pallan',
            role: 'Charter Secretary',
            instagram: 'https://www.instagram.com/johnbethlehm/',
            linkedin: 'https://in.linkedin.com/in/johnbethlehempallan',
            image: '/coordinators/john-bethlehem-pallan.jpg'
          },
          {
            name: 'Nathan Zacharia Saby',
            role: 'Charter Treasurer',
            instagram: 'https://www.instagram.com/nathan_zach?igsh=MWhzMTd4dDh1dnkxeQ==',
            linkedin: 'https://www.linkedin.com/in/nathan-z-saby',
            image: '/coordinators/nathan-zacharia-saby.jpg'
          },
          {
            name: 'Zayan M S',
            role: 'Charter Vice President',
            instagram: 'https://www.instagram.com/zayan_378?igsh=d2s3bmpxbGZoZG8w',
            linkedin: 'https://www.linkedin.com/in/zayan-ms-558329328?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/zayan-m-s.jpg'
          },
          {
            name: 'Sherin Rajan Reumah',
            role: 'Charter Joint Secretary',
            instagram: 'https://www.instagram.com/reuan0/',
            linkedin: 'https://www.linkedin.com/in/sherin-rajan-reumah-788a53238?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/sherin-rajan-reumah.jpg'
          },
          {
            name: 'Ihsan Muhammed K P',
            role: 'Membership Chair',
            instagram: 'https://www.instagram.com/_.ih.s.an._?igsh=MXgxN3ppaDF6Y25ldQ==',
            linkedin: 'https://www.linkedin.com/in/ihsan-muhammed-k-p-a57004329?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/insan-muhammed-k-p.jpg'
          },
          {
            name: 'Aditya Saji',
            role: 'Sergeant at Arms',
            instagram: 'https://www.instagram.com/ramu_the_noob?igsh=MWlrcDBjZTgzN2pwbw==',
            linkedin: 'https://www.linkedin.com/in/aditya-saji-69643a284',
            image: '/coordinators/aditya-saji.jpeg'
          },
          {
            name: 'Vyshnav S',
            role: 'Club Service Chair',
            instagram: 'https://www.instagram.com/vyshnav_7_7_7_5?igsh=dnoyamxyOWZrc28y',
            linkedin: 'https://www.linkedin.com/in/vyshnav-shyam-276a50329?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/vyshnav-s.jpg'
          },
          {
            name: 'Jesuin Peter',
            role: 'Community Service Chair',
            instagram: 'https://www.instagram.com/hey_jesuin?igsh=MWl2eHhoNnljMGhtcQ==',
            linkedin: 'https://www.linkedin.com/in/jesuin-peter-909013352?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: ''
          },
          {
            name: 'Ihsan Sanoj',
            role: 'Professional Service Chair',
            instagram: 'https://www.instagram.com/ihsansanoj10/',
            linkedin: 'https://www.linkedin.com/in/ihsan-sanoj-6a933a332/',
            image: '/coordinators/ihsan-sanoj.HEIC'
          },
          {
            name: 'Aaron Paul',
            role: 'International Service Chair',
            instagram: 'https://www.instagram.com/aaronpaul.xo/',
            linkedin: 'https://www.linkedin.com/in/aaron-paul-762248328/',
            image: '/coordinators/aaron-paul.HEIC'
          },
          {
            name: 'Akash Chem J',
            role: 'Club Editor',
            instagram: 'https://www.instagram.com/akash_c.j?igsh=ZDJyeDE5YmJqYTh0',
            linkedin: 'https://www.linkedin.com/in/akash-chem-j-863925272?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/akas-chem-j.webp'
          },
          {
            name: 'Hrishikesh S Kumar',
            role: 'Social Media Chair',
            instagram: 'https://www.instagram.com/the_hrishi107?igsh=NnExam83OGYwZTU2',
            linkedin: 'https://www.linkedin.com/in/hrishikesh-s-kumar-7bb14b329?utm_source=share_via&utm_content=profile&utm_medium=member_android',
            image: '/coordinators/hrishikesh-s-kumar.jpg'
          },
          {
            name: 'Alestor Aldous',
            role: 'Web Service Chair',
            instagram: 'http://instagram.com/alestor_dev',
            linkedin: 'https://www.linkedin.com/in/alestor123/',
            image: '/coordinators/alestor-aldous.jpg'
          }
        ];

        for (const coord of coordinatorsData) {
          console.log(`Seeding coordinator: ${coord.name} with static path`);
          await strapi.documents('api::coordinator.coordinator').create({
            data: {
              name: coord.name,
              role: coord.role,
              department: '',
              year: '',
              description: '',
              image: coord.image,
              social: {
                instagram: coord.instagram || '',
                linkedin: coord.linkedin || '',
                facebook: ''
              }
            },
            status: 'published'
          });
        }
        console.log('--- Coordinators seeding completed ---');
      } else {
        console.log(`Coordinators already migrated. Skipping.`);
      }

      // Seed introduction single type
      const introCount = await strapi.documents('api::introduction.introduction').count();
      if (introCount === 0) {
        console.log('--- Seeding introduction single type ---');
        await strapi.documents('api::introduction.introduction').create({
          data: {
            title: 'About Rotaract Club of MEC Kochi',
            vision: 'Empower youth to become changemakers. Build inclusive and sustainable communities. Create lasting impact through service and leadership.',
            mission: 'To provide opportunities for Model Engineering College students to develop leadership skills, professional capabilities, and personal integrity through community service, innovative teamwork, and international fellowship.',
            purpose: 'Rotaract Club of Government Model Engineering College, Kochi (Rotaract MEC) is a community-driven student organization. We bring together energetic students who want to develop their professional and leadership skills while making a real difference in the lives of people around us. Our activities span educational support, environment conservation, technical skill development, and community welfare, all while cultivating lifelong friendships.',
            history: 'Officially installed in 2026, the Rotaract Club of Model Engineering College (Rotaract MEC) was established to channel student potential into meaningful societal change. Our foundation rests on the pillars of fellowship, leadership, and hands-on service. Through impact-driven community outreach, tailored professional development initiatives, and collaborative projects, we empower members to become proactive changemakers and empathetic leaders. As we expand our reach and adapt to new challenges, the club continues to grow dynamically, always guided by the timeless Rotary motto, "Service Above Self."',
            values: [
              {
                title: 'Service Above Self',
                description: 'Nurturing a spirit of volunteerism and placing community service at the core of all our initiatives.'
              },
              {
                title: 'Leadership',
                description: 'Empowering students with opportunities to take charge, guide teams, and develop project management skills.'
              },
              {
                title: 'Integrity',
                description: 'Fostering transparency, trust, and ethical responsibility in our relationships and execution of project activities.'
              },
              {
                title: 'Diversity',
                description: 'Welcoming students from all academic streams, interests, and backgrounds to foster a rich, inclusive environment.'
              },
              {
                title: 'Collaboration',
                description: 'Working hand-in-hand with Rotarians, other Rotaract clubs, local communities, and organizations for larger impact.'
              },
              {
                title: 'Innovation',
                description: 'Leveraging engineering expertise and creative design to create modern solutions for social and local problems.'
              }
            ]
          },
          status: 'published'
        });
        console.log('--- Introduction seeding completed ---');
      } else {
        console.log(`Introduction table already contains ${introCount} entries. Updating history...`);
        const intros = await strapi.documents('api::introduction.introduction').findMany();
        if (intros && intros.length > 0) {
          await strapi.documents('api::introduction.introduction').update({
            documentId: intros[0].documentId,
            data: {
              vision: 'Empower youth to become changemakers. Build inclusive and sustainable communities. Create lasting impact through service and leadership.',
              history: 'Officially installed in 2026, the Rotaract Club of Model Engineering College (Rotaract MEC) was established to channel student potential into meaningful societal change. Our foundation rests on the pillars of fellowship, leadership, and hands-on service. Through impact-driven community outreach, tailored professional development initiatives, and collaborative projects, we empower members to become proactive changemakers and empathetic leaders. As we expand our reach and adapt to new challenges, the club continues to grow dynamically, always guided by the timeless Rotary motto, "Service Above Self."',
            }
          });
          console.log('--- Introduction vision and history updated successfully ---');
        }
      }

      // Ensure public role has access to read public content and create submissions
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });

      if (publicRole) {
        const actionsToEnable = [
          'api::subscriber.subscriber.create',
          'api::activity.activity.find',
          'api::activity.activity.findOne',
          'api::blog.blog.find',
          'api::blog.blog.findOne',
          'api::coordinator.coordinator.find',
          'api::coordinator.coordinator.findOne',
          'api::event.event.find',
          'api::event.event.findOne',
          'api::introduction.introduction.find',
          'api::membership.membership.create'
        ];

        for (const action of actionsToEnable) {
          const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });

          if (!existingPermission) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
            console.log(`--- Automatically enabled public permission for ${action} ---`);
          }
        }
      }
    } catch (err: any) {
      console.error('Error during database seeding/permission assignment:', err);
    }
  },
};

