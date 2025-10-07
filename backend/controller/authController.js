import { supabase } from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { setSessionCookie, clearSessionCookie } from '../utils/cookieUtils.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const signup = async (req, res) => {
  const { first_name, last_name, phone_no,email, pan, gstin, adhaar_no, business_type } = req.body;
  let { password } = req.body;

  password = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('business_users')
    .insert([{ first_name, last_name, phone_no, pan, gstin, adhaar_no, email, password, business_type }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Business user created' });
};

export const login = async (req, res) => {
  const { email, password, business_type } = req.body;

  const { data, error } = await supabase
    .from('business_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, data.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const validBusinessType = data.business_type === business_type;
  if (!validBusinessType) return res.status(403).json({ error: 'Unauthorized business type' });

  const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  setSessionCookie(res, token);

  res.json({ message: 'Logged in', user: { id: data.id, username: data.username, email: data.email } });
};


export const getAllBusinessUsers = async (req,res) => {
  try {
  const { data, error } = await supabase
    .from('business_users')
    .select('*');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
  } 
  catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const logout = (req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Logged out' });
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};

// Multer configuration for avatar upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

export const uploadAvatar = upload.single('avatar');

export const updateUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const file = req.file;
    const fileName = `avatar_${userId}_${Date.now()}.${file.mimetype.split('/')[1]}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar: publicUrl })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    res.json({ success: true, avatarUrl: publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeUserAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user record to remove avatar
    const { error } = await supabase
      .from('users')
      .update({ avatar: null })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({ error: 'Failed to remove avatar' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

