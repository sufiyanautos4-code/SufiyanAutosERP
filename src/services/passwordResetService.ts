/**
 * Password Reset Service using Resend API
 * Handles OTP-based password reset flow
 * Works on both localhost and Vercel
 */

// Detect environment
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname !== 'localhost');

const API_BASE_URL = isProduction 
  ? '/api/password-reset' // Vercel serverless function
  : 'http://localhost:3001/api/password-reset'; // Local Express server

export interface PasswordResetResponse {
  success: boolean;
  error?: string;
  message?: string;
  resetToken?: string;
}

/**
 * Step 1: Request OTP via email
 */
export async function requestPasswordResetOTP(
  email: string,
  userName?: string
): Promise<PasswordResetResponse> {
  try {
    const url = isProduction 
      ? `${API_BASE_URL}?action=request`
      : `${API_BASE_URL}/request`;
    
    console.log('Requesting OTP from:', url);
      
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, userName }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Server returned invalid response: ' + responseText.substring(0, 100),
      };
    }
    
    console.log('Parsed data:', data);
    return data;
  } catch (error) {
    console.error('Request OTP error:', error);
    return {
      success: false,
      error: isProduction 
        ? 'Failed to send verification code. Please try again.'
        : 'Failed to connect to server. Please ensure the backend server is running (npm run server).',
    };
  }
}

/**
 * Step 2: Verify OTP and get reset token
 */
export async function verifyPasswordResetOTP(
  email: string,
  otp: string
): Promise<PasswordResetResponse> {
  try {
    const url = isProduction 
      ? `${API_BASE_URL}?action=verify`
      : `${API_BASE_URL}/verify`;
      
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      error: 'Failed to verify code. Please try again.',
    };
  }
}

/**
 * Step 3: Validate reset token before password change
 */
export async function validateResetToken(
  email: string,
  resetToken: string
): Promise<PasswordResetResponse> {
  try {
    const url = isProduction 
      ? `${API_BASE_URL}?action=confirm`
      : `${API_BASE_URL}/confirm`;
      
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, resetToken }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Validate token error:', error);
    return {
      success: false,
      error: 'Failed to validate reset session. Please try again.',
    };
  }
}
