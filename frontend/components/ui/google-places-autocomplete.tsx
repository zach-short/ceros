'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  formattedAddress?: string;
}

interface GooglePlacesAutocompleteProps {
  onAddressSelect: (address: Address) => void;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function GooglePlacesAutocomplete({
  onAddressSelect,
  placeholder = 'Enter your address...',
  value = '',
  disabled = false,
  label,
  className,
  onValueChange,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Function to add MapPin icons to autocomplete items
  const addMapPinIcons = useCallback(() => {
    const pacItems = document.querySelectorAll(
      '.pac-item:not(.has-custom-icon)',
    );
    pacItems.forEach((item) => {
      item.classList.add('has-custom-icon');
      const icon = document.createElement('div');
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="custom-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      item.insertBefore(icon.firstChild!, item.firstChild);
    });
  }, []);

  // Start observing when the input gains focus
  const startObserving = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }, []);

  // Stop observing when input loses focus
  const stopObserving = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    const injectStyles = () => {
      const styleId = 'google-places-autocomplete-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .pac-container {
          background-color: #f8f9fa !important;
          background: #f8f9fa !important;
          border: 1px solid #e9ecef !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          font-family: "Clash Display", system-ui, sans-serif !important;
          z-index: 9999 !important;
          margin-top: 4px !important;
          opacity: 1 !important;
        }

        @media (prefers-color-scheme: dark) {
          .pac-container {
            background-color: #2a2a2a !important;
            background: #2a2a2a !important;
            border-color: #404040 !important;
          }
        }

        .pac-container:after {
          display: none !important;
        }

        .pac-container:before {
          display: none !important;
        }

        .pac-item {
          background-color: #f8f9fa !important;
          background: #f8f9fa !important;
          border-top: 1px solid #e9ecef !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          color: #212529 !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          line-height: 1.2 !important;
          opacity: 1 !important;
        }

        @media (prefers-color-scheme: dark) {
          .pac-item {
            background-color: #2a2a2a !important;
            background: #2a2a2a !important;
            border-top-color: #404040 !important;
            color: #e9ecef !important;
          }
        }

        .pac-item:first-child {
          border-top: none !important;
        }

        .pac-item:hover {
          background-color: #e9ecef !important;
          background: #e9ecef !important;
          color: #212529 !important;
        }

        .pac-item-selected {
          background-color: #e9ecef !important;
          background: #e9ecef !important;
          color: #212529 !important;
        }

        @media (prefers-color-scheme: dark) {
          .pac-item:hover {
            background-color: #404040 !important;
            background: #404040 !important;
            color: #f8f9fa !important;
          }

          .pac-item-selected {
            background-color: #404040 !important;
            background: #404040 !important;
            color: #f8f9fa !important;
          }
        }

        .pac-item-query {
          color: inherit !important;
          font-weight: 500 !important;
        }

        .pac-matched {
          color: hsl(var(--primary)) !important;
          font-weight: 600 !important;
        }

        .pac-icon {
          background-image: none !important;
          background-color: transparent !important;
          width: 16px !important;
          height: 16px !important;
          margin-right: 8px !important;
          margin-top: 2px !important;
          display: none !important;
        }

        .pac-item {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .pac-item .custom-map-pin {
          flex-shrink: 0 !important;
          color: #6c757d !important;
        }

        .pac-item:hover .custom-map-pin {
          color: #212529 !important;
        }

        .pac-item-selected .custom-map-pin {
          color: #212529 !important;
        }

        @media (prefers-color-scheme: dark) {
          .pac-item .custom-map-pin {
            color: #adb5bd !important;
          }

          .pac-item:hover .custom-map-pin {
            color: #f8f9fa !important;
          }

          .pac-item-selected .custom-map-pin {
            color: #f8f9fa !important;
          }
        }

        /* Additional overrides for Google's aggressive styles */
        .pac-container, .pac-container * {
          background-color: #f8f9fa !important;
        }

        .pac-item, .pac-item * {
          background-color: #f8f9fa !important;
          background-image: none !important;
        }

        .pac-item:hover, .pac-item:hover * {
          background-color: #e9ecef !important;
          background-image: none !important;
        }

        .pac-item-selected, .pac-item-selected * {
          background-color: #e9ecef !important;
          background-image: none !important;
        }

        @media (prefers-color-scheme: dark) {
          .pac-container, .pac-container * {
            background-color: #2a2a2a !important;
          }

          .pac-item, .pac-item * {
            background-color: #2a2a2a !important;
          }

          .pac-item:hover, .pac-item:hover * {
            background-color: #404040 !important;
          }

          .pac-item-selected, .pac-item-selected * {
            background-color: #404040 !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    const initializeAutocomplete = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          setError(
            'Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.',
          );
          return;
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();
        setIsLoaded(true);

        injectStyles();

        const processPlace = (place: google.maps.places.PlaceResult) => {
          const addressComponents = place.address_components;
          console.log('Raw address components from Google:', addressComponents);
          const address: Address = {
            formattedAddress: place.formatted_address,
          };

          addressComponents?.forEach((component) => {
            const types = component.types;
            console.log('Processing component:', component.long_name, 'types:', types);

            if (types.includes('street_number')) {
              address.street = component.long_name;
            } else if (types.includes('route')) {
              address.street = address.street
                ? `${address.street} ${component.long_name}`
                : component.long_name;
            } else if (types.includes('locality')) {
              address.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              address.state = component.short_name;
            } else if (types.includes('postal_code')) {
              address.zip = component.long_name;
            } else if (types.includes('country')) {
              address.country = component.long_name;
            }
          });

          console.log('Final parsed address object:', address);

          setError(null);
          const formattedAddr = place.formatted_address || '';
          setInputValue(formattedAddr);
          onValueChange?.(formattedAddr);
          onAddressSelect(address);
          stopObserving();
        };

        observerRef.current = new MutationObserver((mutations) => {
          addMapPinIcons();

          // Check if PAC container is clicked (user selecting an option)
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (element.classList?.contains('pac-item')) {
                    element.addEventListener('mousedown', () => {
                      console.log('PAC item mousedown detected');
                      const pacText = element.textContent || '';
                      console.log('PAC item text:', pacText);

                      // Set a flag to track this click
                      element.setAttribute('data-clicked', 'true');

                      // Multiple attempts to get the place data
                      const attemptPlace = (attempt = 1) => {
                        setTimeout(() => {
                          const place = autocompleteRef.current?.getPlace();
                          console.log(`PAC click attempt ${attempt}:`, place);

                          if (place && place.address_components && place.address_components.length > 0) {
                            console.log(`PAC click success on attempt ${attempt}`);
                            processPlace(place);
                          } else if (attempt < 6) {
                            attemptPlace(attempt + 1);
                          } else {
                            console.log('PAC click failed after all attempts');
                          }
                        }, attempt * 50); // 50ms, 100ms, 150ms, etc.
                      };

                      attemptPlace();
                    });

                    element.addEventListener('click', () => {
                      console.log('PAC item click detected');
                    });
                  }
                }
              });
            }
          });
        });

        if (inputRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: ['us'] },
              fields: [
                'address_components',
                'formatted_address',
                'geometry.location',
                'name',
              ],
            },
          );

          // Wait for autocomplete to be fully initialized
          setTimeout(() => {
            if (inputRef.current && autocompleteRef.current) {
              console.log('Google Places Autocomplete fully initialized');

              inputRef.current.addEventListener('focus', startObserving);
              inputRef.current.addEventListener('blur', () => {
                setTimeout(stopObserving, 200);
              });

              // Add additional event listeners for place selection
              inputRef.current.addEventListener('input', () => {
                // Clear previous selection when user types
                setError(null);
              });

              // Add a more robust place_changed listener
              autocompleteRef.current.addListener('place_changed', () => {
                console.log('place_changed event triggered!');

                // Multiple retry attempts with different delays
                const attemptToGetPlace = (attempt = 1) => {
                  const delay = attempt * 25; // 25ms, 50ms, 75ms, 100ms

                  setTimeout(() => {
                    const place = autocompleteRef.current?.getPlace();
                    console.log(`Attempt ${attempt} - Retrieved place object:`, place);

                    if (place && place.address_components && place.address_components.length > 0) {
                      console.log(`Success on attempt ${attempt}`);
                      processPlace(place);
                    } else if (attempt < 4) {
                      console.log(`Attempt ${attempt} failed, retrying...`);
                      attemptToGetPlace(attempt + 1);
                    } else {
                      console.log('All attempts failed');
                      setError('Please select a valid address from the dropdown');
                    }
                  }, delay);
                };

                attemptToGetPlace();
              });

              // Also add a direct listener to the autocomplete input for immediate feedback
              inputRef.current.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  console.log('Enter key pressed, checking for place...');
                  setTimeout(() => {
                    const place = autocompleteRef.current?.getPlace();
                    if (place && place.address_components) {
                      console.log('Place found via Enter key:', place);
                      processPlace(place);
                    }
                  }, 100);
                }
              });
            }
          }, 100); // Give autocomplete time to fully initialize
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(
          'Failed to load Google Maps. Please check your API key and try again.',
        );
      }
    };

    if (!isLoaded && !error) {
      initializeAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    onAddressSelect,
    isLoaded,
    error,
    addMapPinIcons,
    startObserving,
    stopObserving,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);
    onValueChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Check if a place was selected via enter key
      setTimeout(() => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.address_components) {
          console.log('Place selected via Enter key:', place);
        }
      }, 100);
    }
  };

  if (error) {
    return (
      <div className='space-y-2'>
        {label && <Label>{label}</Label>}
        <div className='text-red-500 text-sm p-3 border border-red-200 rounded-md bg-red-50'>
          {error}
        </div>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={className}
        />
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {label && <Label htmlFor='address-input'>{label}</Label>}
      <Input
        ref={inputRef}
        id='address-input'
        type='text'
        placeholder={isLoaded ? placeholder : 'Loading Google Maps...'}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || !isLoaded}
        className={className}
        autoComplete='off'
      />
      {!isLoaded && !error && (
        <div className='text-sm text-muted-foreground'>
          Loading address autocomplete...
        </div>
      )}
    </div>
  );
}
