import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, Upload, Save, Loader2, AlertCircle } from 'lucide-react';
import { profileService, ProfileUpdateInput } from '../services/profile';
import { User } from '../types';
import { Avatar } from './Avatar';

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => Promise<void>;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [username, setUsername] = useState(user.username);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'crop'>('form');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setUsername(user.username);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError(null);
      setStep('form');
    }
  }, [isOpen, user.username]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setStep('crop');
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updates: ProfileUpdateInput = {};

      if (username.trim() !== user.username) {
        updates.username = username.trim();
      }

      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        const avatarUrl = await profileService.uploadAvatar(user.id, croppedImage);
        updates.avatarUrl = avatarUrl;
      }

      if (updates.username || updates.avatarUrl) {
        await profileService.updateProfile(user.id, updates);
        await onSuccess();
        onClose();
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:scale-95 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3 sm:p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}

          {step === 'form' && (
            <>
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter username"
                  disabled={loading}
                  maxLength={30}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {username.length}/30 characters
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <Avatar
                    avatarUrl={user.avatarUrl}
                    username={user.username}
                    size="md"
                    showBorder={true}
                    borderColor="border-emerald-500"
                  />
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-h-[44px]"
                    >
                      <Upload size={18} />
                      <span>Upload New Photo</span>
                    </button>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'crop' && imageSrc && (
            <div className="space-y-4">
              <div className="relative w-full" style={{ height: 'min(60vh, 400px)' }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                  style={{
                    containerStyle: {
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    },
                  }}
                />
              </div>

              {/* Zoom Control */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Zoom
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleBackToForm}
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm sm:text-base font-medium active:scale-95 min-h-[44px]"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-5 md:p-6 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (step === 'crop' && !croppedAreaPixels)}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

