# Stripe Checkout Integration

This implementation provides a complete Stripe checkout flow for your Direct Connect Access app.

## Features

✅ **Form with Required Fields:**
- First Name (required)
- Last Name (required)  
- Email Address (required)
- Phone Number (optional)
- Inmate Name (optional)
- Inmate ID (optional)
- Inmate Location (optional)

✅ **Stripe Integration:**
- Creates customer in Stripe with form data
- $20 USD hardcoded price
- Secure checkout session
- Success/Cancel pages

## How It Works

1. **User fills out form** with their information
2. **Clicks "Go to Checkout"** button
3. **Customer is created** in Stripe with form data stored in metadata
4. **User is redirected** to Stripe's secure checkout page
5. **Payment processed** with success/cancel handling

## Files Created

- `src/app/components/CheckoutForm.js` - Main form component
- `src/app/api/create-checkout/route.js` - API endpoint for Stripe integration
- `src/app/success/page.js` - Success page after payment
- `src/app/cancel/page.js` - Cancel page if payment cancelled
- `.env.local` - Environment variables (not committed to Git)

## Stripe Configuration

**Product Created:**
- Name: Premium Digital Course
- Price: $20 USD (2000 cents)
- Product ID: `prod_SSntqeXSJJOTGA`
- Price ID: `price_1RXsHSDIiIX8ElFZLEMIkpnf`

## Testing

Use Stripe test card numbers:
- **Success:** `4242424242424242`
- **Declined:** `4000000000000002`
- Use any future expiry date and any 3-digit CVC

## Environment Variables

The app uses these environment variables in `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_51RWiOF...
NEXT_PUBLIC_URL=http://localhost:3000
```

## Running the App

```bash
npm run dev
```

Visit `http://localhost:3000` to see the checkout form.

## Next Steps

1. **Webhooks:** Set up webhook endpoints to handle successful payments
2. **Email notifications:** Send confirmation emails after successful payment
3. **Customer dashboard:** Create a dashboard to view customer data
4. **Production:** Update environment variables for production deployment 