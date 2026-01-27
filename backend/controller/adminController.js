

const createAdmin =async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password'
        });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email already exists'
        });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create admin user
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true // Admins are auto-verified
      });
  
      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
  
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating admin'
      });
    }
  });
  
  // ✅ ONE-TIME SETUP - Create First Admin (DISABLE AFTER FIRST USE)
  router.post('/setup-first-admin', async (req, res) => {
    try {
      // ✅ SECURITY: Check if any admin exists
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(403).json({
          success: false,
          message: 'Admin already exists. Use /create-admin endpoint instead.'
        });
      }
  
      const { name, email, password, secretKey } = req.body;
  
      // ✅ SECURITY: Require a secret key from environment
      if (secretKey !== process.env.ADMIN_SETUP_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid setup key'
        });
      }
  
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password'
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
  
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.status(201).json({
        success: true,
        message: 'First admin created successfully',
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
  
    } catch (error) {
      console.error('Setup admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error setting up admin'
      });
    }
  });