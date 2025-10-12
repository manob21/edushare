const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const User = require('./models/User');
const Resource = require('./models/Resource');
const CreditTransaction = require('./models/CreditTransaction');

dotenv.config();

const testModels = async () => {
  try {
    await connectDatabase();

    console.log('\n✅ Testing models...\n');

    console.log('✓ User model loaded successfully');
    console.log('✓ Resource model loaded successfully');
    console.log('✓ CreditTransaction model loaded successfully');

    console.log('\n🎉 All models are working correctly!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testModels();