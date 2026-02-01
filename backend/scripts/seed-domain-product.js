const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define Product schema inline
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  pricing: {
    monthly: Number,
    yearly: Number,
  },
  description: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

async function seedDomainProduct() {
  try {
    // Check if domain product already exists
    const existing = await Product.findOne({ type: 'domain', name: 'Domain Registration' });
    
    if (existing) {
      console.log('✅ Domain product already exists:', existing._id);
      console.log('Use this productId in your code:', existing._id.toString());
      process.exit(0);
    }

    // Create domain product
    const domainProduct = await Product.create({
      name: 'Domain Registration',
      type: 'domain',
      pricing: {
        yearly: 999, // ₹999 per year (adjust as needed)
      },
      description: 'Register your domain name for 1 year',
      status: 'active',
    });

    console.log('✅ Domain product created successfully!');
    console.log('Product ID:', domainProduct._id.toString());
    console.log('\n📋 Update your DomainChecker.jsx with this productId:');
    console.log(`const productId = '${domainProduct._id.toString()}';`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding domain product:', error);
    process.exit(1);
  }
}

seedDomainProduct();
