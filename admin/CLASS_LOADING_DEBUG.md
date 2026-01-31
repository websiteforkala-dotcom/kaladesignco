# AdminPanel Class Loading Debug Guide

## Issue: "AdminPanel class not found"

This error occurs when the AdminPanel class is not available in the global scope when the test tries to access it.

## Debugging Steps

### 1. Check Script Loading Order
Open browser console and verify these scripts load in order:
1. Supabase library
2. supabase-config.js
3. database-service.js
4. admin-script.js

### 2. Check Console for Errors
Look for these messages in console:
- ✅ "Loading AdminPanel class..."
- ✅ "AdminPanel class defined successfully"
- ✅ "AdminPanel assigned to window object"

### 3. Test Files to Use

#### Basic Class Test
Open: `admin/test-minimal-class.html`
- Tests only AdminPanel class loading
- No dependencies required
- Should show "SUCCESS" message

#### Debug Loading Process
Open: `admin/debug-class-loading.html`
- Shows detailed loading timeline
- Monitors when AdminPanel becomes available
- Logs all steps in real-time

#### Full Functionality Test
Open: `admin/test-functionality.html`
- Tests complete admin panel functionality
- Includes database and dependency checks
- More comprehensive but requires all services

### 4. Manual Console Tests

Open any test page and run in browser console:

```javascript
// Check if class exists
console.log('AdminPanel type:', typeof AdminPanel);
console.log('window.AdminPanel type:', typeof window.AdminPanel);

// Check class methods
if (window.AdminPanel) {
    console.log('AdminPanel methods:', Object.getOwnPropertyNames(AdminPanel.prototype));
}

// Try to create instance
try {
    const test = new AdminPanel();
    console.log('✅ Instance created successfully');
} catch (error) {
    console.log('❌ Instance creation failed:', error.message);
}
```

### 5. Common Issues & Solutions

#### Issue: Script Not Loading
**Symptoms**: No console messages from admin-script.js
**Solution**: Check file path, ensure admin-script.js exists

#### Issue: Syntax Error in Script
**Symptoms**: Script stops loading partway through
**Solution**: Check browser console for syntax errors

#### Issue: Timing Problem
**Symptoms**: Class available later but not immediately
**Solution**: Add delay or use event listeners

#### Issue: Scope Problem
**Symptoms**: Class defined but not on window object
**Solution**: Check global assignment code

### 6. Quick Fixes

#### Fix 1: Force Global Assignment
Add to admin-script.js after class definition:
```javascript
// Force global assignment
window.AdminPanel = AdminPanel;
globalThis.AdminPanel = AdminPanel;
```

#### Fix 2: Wait for Class Availability
In test scripts, wait for class:
```javascript
async function waitForAdminPanel() {
    let attempts = 0;
    while (!window.AdminPanel && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    return window.AdminPanel;
}
```

#### Fix 3: Check Dependencies
Ensure all required scripts load first:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../database/supabase-config.js"></script>
<script src="../database/database-service.js"></script>
<script src="admin-script.js"></script>
```

### 7. Verification Checklist

- [ ] admin-script.js file exists and is accessible
- [ ] No 404 errors in Network tab
- [ ] No JavaScript errors in Console tab
- [ ] Console shows "AdminPanel class defined successfully"
- [ ] `typeof window.AdminPanel` returns "function"
- [ ] Can create new instance: `new AdminPanel()`

### 8. Alternative Testing

If class loading fails, test with minimal script:

```html
<script>
class TestAdminPanel {
    constructor() {
        console.log('Test class created');
    }
}
window.TestAdminPanel = TestAdminPanel;
console.log('Test class available:', typeof window.TestAdminPanel);
</script>
```

### 9. Browser Compatibility

Ensure browser supports ES6 classes:
- Chrome 49+
- Firefox 45+
- Safari 9+
- Edge 13+

### 10. Network Issues

Check if files are loading from correct URLs:
- Open Network tab in DevTools
- Reload page
- Verify all scripts return 200 status
- Check for CORS issues

## Expected Behavior

When working correctly, you should see:

1. **Console Messages**:
   ```
   Loading AdminPanel class...
   AdminPanel class defined successfully
   AdminPanel assigned to window object
   ```

2. **Global Access**:
   ```javascript
   typeof window.AdminPanel === 'function'
   ```

3. **Instance Creation**:
   ```javascript
   const panel = new AdminPanel(); // Should work
   ```

## Contact Support

If issue persists after trying all steps:
1. Provide browser console output
2. Share Network tab screenshot
3. Specify which test files were used
4. Include browser version and OS

The AdminPanel class should be available immediately after the admin-script.js loads.