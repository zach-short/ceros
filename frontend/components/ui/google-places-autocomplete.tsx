'use client';

import { useEffect, useRef, useState } from 'react';
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
}

export function GooglePlacesAutocomplete({
  onAddressSelect,
  placeholder = 'Enter your address...',
  value = '',
  disabled = false,
  label,
  className,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
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

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();

            if (!place || !place.address_components) {
              setError('Please select a valid address from the dropdown');
              return;
            }

            const addressComponents = place.address_components;
            const address: Address = {
              formattedAddress: place.formatted_address,
            };

            addressComponents.forEach((component) => {
              const types = component.types;

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

            setError(null);
            setInputValue(place.formatted_address || '');
            onAddressSelect(address);
          });
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
    };
  }, [onAddressSelect, isLoaded, error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
