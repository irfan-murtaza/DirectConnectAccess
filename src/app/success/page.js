'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const savePaymentData = async () => {
      if (!sessionId || isDataSaved) return;

      try {
        // Get session data from Stripe (you'd need to create this endpoint)
        const sessionResponse = await fetch(`/api/get-session?session_id=${sessionId}`);
        if (!sessionResponse.ok) {
          throw new Error('Failed to get session data');
        }
        
        const sessionData = await sessionResponse.json();
        
        // Save to Firestore
        const saveResponse = await fetch('/api/save-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscriberName: `${sessionData.customerData?.firstName || ''} ${sessionData.customerData?.lastName || ''}`.trim(),
            email: sessionData.customerData?.email || '',
            phoneNumber: sessionData.customerData?.phoneNumber || '',
            inmateName: sessionData.customerData?.inmateName || '',
            inmateId: sessionData.customerData?.inmateId || '',
            inmateLocation: sessionData.customerData?.inmateLocation || '',
            facilityName: sessionData.customerData?.facilityName || '',
            paymentStatus: 'Success',
            amountPaid: sessionData.amountPaid || process.env.PRODUCT_PRICE || '20',
            stripeSessionId: sessionId,
            customerId: sessionData.customerId || ''
          }),
        });

        if (saveResponse.ok) {
          setIsDataSaved(true);
          console.log('Payment data saved to Firestore successfully');
        } else {
          throw new Error('Failed to save payment data');
        }
      } catch (error) {
        console.error('Error saving payment data:', error);
        setSaveError('Failed to save payment data');
      }
    };

    savePaymentData();
  }, [sessionId, isDataSaved]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center py-12">
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Thank you for your subscription! You will receive a confirmation email shortly with your access details and next steps.
          </p>
          
          {/* Success Details */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 text-green-800">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="font-semibold">Your subscription is now active</span>
            </div>
            {isDataSaved && (
              <div className="mt-2 text-sm text-green-700">
                ✓ Payment data saved successfully
              </div>
            )}
            {saveError && (
              <div className="mt-2 text-sm text-red-700">
                ⚠ {saveError}
              </div>
            )}
          </div>
          
          <a
            href="/"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Return Home</span>
          </a>
        </div>
      </div>
    </div>
  );
} 