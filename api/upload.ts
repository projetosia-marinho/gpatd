import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = await form.parse(req);
    const fileArray = files.file;
    if (!fileArray) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileObj = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!clientEmail || !privateKey || !folderId) {
      return res.status(500).json({ error: 'Google Drive credentials not configured on the server.' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: fileObj.originalFilename || 'uploaded_file',
      parents: [folderId],
    };

    const media = {
      mimeType: fileObj.mimetype || 'application/octet-stream',
      body: fs.createReadStream(fileObj.filepath),
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    try {
      await drive.permissions.create({
        fileId: driveResponse.data.id as string,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.error('Could not set permissions', permErr);
    }

    return res.status(200).json({
      success: true,
      link: driveResponse.data.webViewLink,
      downloadLink: driveResponse.data.webContentLink,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
