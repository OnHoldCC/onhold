// SingleSparkFront TokenMediaUpload; only API and translation bindings adapted for ONHOLD.
import { useEffect, useRef, useState } from 'react';
import { SingleSparkLoading } from '@singlespark/component-atlas/primitives';
import { SingleSparkIcon } from '@singlespark/component-atlas/icons';

export function TokenMediaUpload({
  value,
  t,
  authenticated,
  onAuthenticate,
  onChange,
  onBusyChange,
  uploadMedia,
  large = false,
  imagesOnly = false,
  disabled = false,
  compact = false,
}: {
  value: string;
  t: (key: string) => string;
  authenticated: boolean;
  onAuthenticate: () => void;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  uploadMedia?: (file: File) => Promise<string>;
  large?: boolean;
  imagesOnly?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const uploadedUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState(value);
  const [mediaType, setMediaType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isVideo = mediaType.startsWith('video/') || /\.(?:mp4|webm)(?:$|[?#])/i.test(preview);

  useEffect(() => {
    if (objectUrlRef.current && (!uploadedUrlRef.current || value === uploadedUrlRef.current)) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    uploadedUrlRef.current = null;
    setPreview(value);
  }, [value]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const clear = () => {
    if (uploading || disabled) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    uploadedUrlRef.current = null;
    setPreview('');
    setMediaType('');
    setError(null);
    onChange('');
  };

  const upload = async (file: File | undefined) => {
    if (!file || uploading || disabled || !authenticated) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    uploadedUrlRef.current = null;
    setPreview(objectUrlRef.current);
    setMediaType(file.type);
    setUploading(true);
    setError(null);
    onBusyChange(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const publish = async () => {
        if (!uploadMedia) throw Error('create.media.unavailable');
        return uploadMedia(file);
      };
      const url = await Promise.race([publish(), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(Error('create.media.timeout')), 60_000);
      })]);
      // Keep the selected file visible without downloading it again from the IPFS gateway.
      uploadedUrlRef.current = url;
      onChange(url);
    } catch (cause) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      uploadedUrlRef.current = null;
      setPreview(value);
      setMediaType('');
      const key = cause instanceof Error ? cause.message : '';
      setError(['create.media.invalidImage', 'create.media.tooLarge', 'create.media.unavailable', 'create.media.timeout'].includes(key) ? key
        : 'create.media.failed');
    } finally {
      clearTimeout(timer);
      setUploading(false);
      onBusyChange(false);
    }
  };

  return (
    <div className={`token-media-upload${large ? ' token-media-upload--large' : ''}${compact ? ' token-media-upload--compact' : ''}`}>
      <button
        className="create-media-button"
        type="button"
        aria-label={t(authenticated ? imagesOnly ? 'create.media.selectImage' : 'create.media.select' : 'create.media.authenticate')}
        title={t(authenticated ? imagesOnly ? 'create.media.selectImage' : 'create.media.select' : 'create.media.authenticate')}
        disabled={uploading || disabled}
        aria-busy={uploading}
        onClick={() => authenticated ? inputRef.current?.click() : onAuthenticate()}
      >
        {preview ? (
          isVideo ? (
            <video src={preview} aria-label={t('create.media.preview')} muted loop autoPlay playsInline />
          ) : (
            <img src={preview} alt={t('create.media.preview')} />
          )
        ) : (
          compact ? <SingleSparkIcon name="image" size={26} className="token-media-upload__image-icon" /> : <>{!imagesOnly && <i className="ph ph-image" />}<span>{t(imagesOnly ? 'create.media.selectImage' : 'create.media.placeholder')}</span><small>{t(imagesOnly ? 'create.media.imageHint' : 'create.media.dropHint')}</small></>
        )}
        {uploading && <span className="create-media-uploading" aria-hidden="true"><SingleSparkLoading size={24} decorative /></span>}
      </button>
      {uploading && <span className="token-media-upload__status" role="status">{t('create.media.uploading')}</span>}
      <input
        ref={inputRef}
        data-testid="token-media-input"
        aria-label={t('create.media.fileInput')}
        type="file"
        hidden
        accept={imagesOnly ? 'image/png,image/jpeg,image/webp' : 'image/png,image/jpeg,image/webp,video/mp4,video/webm'}
        disabled={uploading || disabled}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          void upload(file);
        }}
      />
      {error && <div className="token-media-upload__error" role="alert">{t(error)}</div>}
      {preview && !uploading && <button className="token-media-upload__remove" type="button" disabled={disabled} onClick={clear}>{t(imagesOnly ? 'create.media.removeImage' : 'create.media.remove')}</button>}
    </div>
  );
}
