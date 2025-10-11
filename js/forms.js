/**
 * forms.js - Form validation and submission handling
 * miketineo.com
 */

(function() {
  'use strict';

  // =====================================================
  // Contact Form Handler
  // =====================================================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    // Custom validation messages
    const validationMessages = {
      valueMissing: 'This field is required.',
      typeMismatch: 'Please enter a valid email address.',
      tooShort: 'Please enter at least {minlength} characters.',
      tooLong: 'Please enter no more than {maxlength} characters.',
    };

    // Show validation error
    function showError(input, message) {
      const formGroup = input.closest('.form-group');
      let errorElement = formGroup.querySelector('.form-error');

      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.setAttribute('role', 'alert');
        formGroup.appendChild(errorElement);
      }

      errorElement.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorElement.id || 'error-' + input.id);
    }

    // Clear validation error
    function clearError(input) {
      const formGroup = input.closest('.form-group');
      const errorElement = formGroup.querySelector('.form-error');

      if (errorElement) {
        errorElement.remove();
      }

      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }

    // Validate single field
    function validateField(input) {
      // Clear previous errors
      clearError(input);

      // Check validity
      if (!input.validity.valid) {
        let message = validationMessages.valueMissing;

        if (input.validity.typeMismatch) {
          message = validationMessages.typeMismatch;
        } else if (input.validity.tooShort) {
          message = validationMessages.tooShort.replace('{minlength}', input.minLength);
        } else if (input.validity.tooLong) {
          message = validationMessages.tooLong.replace('{maxlength}', input.maxLength);
        } else if (input.validationMessage) {
          message = input.validationMessage;
        }

        showError(input, message);
        return false;
      }

      return true;
    }

    // Real-time validation on blur
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.addEventListener('blur', function() {
        if (this.value.trim() !== '') {
          validateField(this);
        }
      });

      // Clear error on input
      input.addEventListener('input', function() {
        if (this.getAttribute('aria-invalid') === 'true') {
          clearError(this);
        }
      });
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Validate all fields
      let isValid = true;
      formInputs.forEach(input => {
        if (input.hasAttribute('required')) {
          if (!validateField(input)) {
            isValid = false;
          }
        }
      });

      // If validation fails, focus first invalid field
      if (!isValid) {
        const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Disable submit button
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      // Submit form using Fetch API
      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          // Show success message
          const successMessage = document.getElementById('successMessage');
          if (successMessage) {
            successMessage.style.display = 'block';
          }

          // Show toast notification
          if (window.showToast) {
            window.showToast('Message sent successfully!', 'success');
          }

          // Reset form
          contactForm.reset();

          // Hide success message after 5 seconds
          setTimeout(() => {
            if (successMessage) {
              successMessage.style.display = 'none';
            }
          }, 5000);

        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => {
        console.error('Form submission error:', error);

        // Show error toast
        if (window.showToast) {
          window.showToast('There was an error sending your message. Please try again.', 'error');
        }
      })
      .finally(() => {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      });
    });
  }

  // =====================================================
  // Newsletter Form Handlers
  // =====================================================
  const newsletterForms = document.querySelectorAll('.newsletter-form');

  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const emailInput = form.querySelector('input[type="email"]');
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;

      // Basic email validation
      if (!emailInput.validity.valid) {
        emailInput.focus();
        if (window.showToast) {
          window.showToast('Please enter a valid email address.', 'error');
        }
        return;
      }

      // Disable submit button
      submitButton.disabled = true;
      submitButton.textContent = 'Subscribing...';

      // Submit form
      const formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          // Show success message
          if (window.showToast) {
            window.showToast('Successfully subscribed! Check your email for confirmation.', 'success');
          }

          // Reset form
          form.reset();
        } else {
          throw new Error('Subscription failed');
        }
      })
      .catch(error => {
        console.error('Newsletter subscription error:', error);

        if (window.showToast) {
          window.showToast('There was an error subscribing. Please try again.', 'error');
        }
      })
      .finally(() => {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      });
    });
  });

  // =====================================================
  // Form Analytics (Optional)
  // =====================================================
  // Track form interactions for conversion optimization
  function trackFormInteraction(formName, eventType) {
    // If you add analytics (like Plausible), track here
    console.log(`Form event: ${formName} - ${eventType}`);

    // Example with Plausible:
    // if (window.plausible) {
    //   window.plausible('Form Interaction', {
    //     props: {
    //       form: formName,
    //       event: eventType
    //     }
    //   });
    // }
  }

  // Track when users start filling forms
  document.querySelectorAll('form').forEach(form => {
    const formInputs = form.querySelectorAll('input, textarea');
    let interactionTracked = false;

    formInputs.forEach(input => {
      input.addEventListener('focus', function() {
        if (!interactionTracked) {
          const formName = form.id || 'unknown';
          trackFormInteraction(formName, 'started');
          interactionTracked = true;
        }
      }, { once: true });
    });
  });

})();
