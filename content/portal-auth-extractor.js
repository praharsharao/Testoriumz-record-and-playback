// Content script for extracting authentication from TestoriumZ Portal (ReportPortal-style)
(function() {
  'use strict';
  
  console.log('TestoriumZ Portal Auth Extractor (ReportPortal-style) loaded');
  
  // Function to extract authentication data using ReportPortal patterns
  function extractAuthData() {
    const authData = {
      token: null,
      userInfo: null,
      cookies: {},
      hasAuth: false,
      isLoggedIn: false,
      sessionData: null
    };
    
    try {
      // Check for ReportPortal authentication indicators
      const hasAuthIndicators = 
        // Check for authenticated content
        document.body.innerHTML.includes('ALL DASHBOARDS') ||
        document.body.innerHTML.includes('Add New Dashboard') ||
        document.body.innerHTML.includes('EDIT') ||
        document.body.innerHTML.includes('DELETE') ||
        // Check for user session elements
        !!document.querySelector('[data-testid="user-profile"]') ||
        !!document.querySelector('.user-profile') ||
        !!document.querySelector('.profile') ||
        !!document.querySelector('[class*="user"]') ||
        // Check for logout functionality
        !!document.querySelector('[data-testid="logout"]') ||
        !!document.querySelector('.logout') ||
        !!document.querySelector('[class*="logout"]') ||
        // Check if not on login page
        (!window.location.href.includes('#login') && 
         !window.location.href.includes('/login') &&
         !window.location.href.includes('login'));
      
      // Extract authentication data from ReportPortal patterns
      let token = null;
      let userInfo = null;
      let sessionData = null;
      
      // Check localStorage for ReportPortal auth data
      const authKeys = [
        'accessToken', 'token', 'authToken', 'jwt', 'bearer',
        'rp_access_token', 'rp_token', 'rp_auth',
        'userInfo', 'user', 'currentUser', 'session',
        'rp_user', 'rp_session', 'rp_userInfo',
        'auth_token', 'access_token', 'bearer_token'
      ];
      
      for (const key of authKeys) {
        const value = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.token || parsed.access_token) {
              token = parsed.token || parsed.access_token;
            }
            if (parsed.user || parsed.userInfo || parsed.email) {
              userInfo = parsed.user || parsed.userInfo || { email: parsed.email };
            }
            if (parsed.session || parsed.sessionData) {
              sessionData = parsed.session || parsed.sessionData;
            }
          } catch (e) {
            // If not JSON, might be a simple token
            if (key.includes('token') || key.includes('auth')) {
              token = value;
            } else if (key.includes('user')) {
              userInfo = { email: value };
            }
          }
        }
      }
      
      // Check cookies for auth data
      document.cookie.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          authData.cookies[key] = value;
        }
      });
      
      if (!token) {
        token = authData.cookies.accessToken || 
                authData.cookies.token || 
                authData.cookies.jwt || 
                authData.cookies.authToken;
      }
      
      // Check for user info in page content (ReportPortal style)
      if (!userInfo) {
        // Look for user data in page content
        const userMatch = document.body.innerHTML.match(/"owner":"([^"]+)"/);
        if (userMatch) {
          userInfo = { 
            username: userMatch[1], 
            email: userMatch[1] + '@testoriumz.com' 
          };
        }
        
        // Look for email in page content
        const emailMatch = document.body.innerHTML.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          userInfo = { email: emailMatch[0] };
        }
      }
      
      // Determine if user is logged in
      authData.isLoggedIn = hasAuthIndicators || !!token || !!userInfo;
      authData.hasAuth = !!token || !!userInfo;
      authData.token = token;
      authData.userInfo = userInfo;
      authData.sessionData = sessionData;
      
      console.log('Extracted ReportPortal auth data:', authData);
      
      return authData;
    } catch (error) {
      console.error('Error extracting auth data:', error);
      return authData;
    }
  }
  
  // Function to listen for authentication changes
  function setupAuthListener() {
    // Listen for storage changes
    window.addEventListener('storage', function(e) {
      if (e.key && (e.key.includes('token') || e.key.includes('user') || e.key.includes('auth'))) {
        console.log('Auth storage changed:', e.key, e.newValue);
        const authData = extractAuthData();
        
        // Send message to extension
        if (window.chrome && window.chrome.runtime) {
          window.chrome.runtime.sendMessage({
            type: 'portal-auth-update',
            authData: authData
          });
        }
      }
    });
    
    // Monitor for successful login indicators (ReportPortal style)
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for ReportPortal login success indicators
              const loginSuccessIndicators = [
                'Signed in successfully',
                'ALL DASHBOARDS',
                'Add New Dashboard',
                'Welcome',
                'Dashboard'
              ];
              
              for (const indicator of loginSuccessIndicators) {
                if (node.textContent && node.textContent.includes(indicator)) {
                  console.log('ReportPortal login success detected:', indicator);
                  setTimeout(() => {
                    const authData = extractAuthData();
                    if (window.chrome && window.chrome.runtime) {
                      window.chrome.runtime.sendMessage({
                        type: 'portal-login-success',
                        authData: authData
                      });
                    }
                  }, 1000); // Wait a bit for auth data to be stored
                  return;
                }
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check for URL changes (SPA navigation)
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('URL changed, checking auth status');
        setTimeout(() => {
          const authData = extractAuthData();
          if (authData.isLoggedIn && window.chrome && window.chrome.runtime) {
            window.chrome.runtime.sendMessage({
              type: 'portal-auth-update',
              authData: authData
            });
          }
        }, 500);
      }
    }, 1000);
  }
  
  // Initialize
  setupAuthListener();
  
  // Extract initial auth data
  const initialAuthData = extractAuthData();
  
  // Make auth data available globally for the extension to access
  window.testoriumzAuthData = initialAuthData;
  
  // Listen for messages from extension
  if (window.chrome && window.chrome.runtime) {
    window.chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.type === 'extract-auth') {
        const authData = extractAuthData();
        sendResponse(authData);
      }
    });
  }
  
  // Send initial auth data to extension
  if (initialAuthData.isLoggedIn && window.chrome && window.chrome.runtime) {
    setTimeout(() => {
      window.chrome.runtime.sendMessage({
        type: 'portal-auth-update',
        authData: initialAuthData
      });
    }, 1000);
  }
  
})();
