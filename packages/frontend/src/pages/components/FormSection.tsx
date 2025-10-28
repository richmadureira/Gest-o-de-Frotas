import React from 'react';
import { Paper, Divider, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Button, CircularProgress, Box } from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { IMAGE_BASE_URL } from '../../services/api';

interface FormSectionProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | undefined;
  options: { value: string; label: string }[];
  description?: { condition: string };
  descriptionValue?: string;
  onDescriptionChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  image?: string | null;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage?: boolean;
  disabled?: boolean;
}

const FormSection = ({
  title,
  value,
  onChange,
  error,
  options,
  description,
  descriptionValue,
  onDescriptionChange,
  image,
  onImageChange,
  uploadingImage = false,
  disabled = false,
}: FormSectionProps) => (
  <>
    <Divider textAlign="left">
      <Typography variant="h6" color="primary">
        {title}
      </Typography>
    </Divider>
    <FormControl component="fieldset" fullWidth margin="normal" error={!!error}>
      <FormLabel component="legend">{title}</FormLabel>
      <RadioGroup value={value} onChange={onChange} row>
        {options.map((option) => (
          <FormControlLabel 
            key={option.value} 
            value={option.value} 
            control={<Radio disabled={disabled} />} 
            label={option.label} 
          />
        ))}
      </RadioGroup>
      {error && <Typography color="error">{error}</Typography>}
      {description && value === description.condition && (
        <>
          <TextField
            label="Descrição"
            variant="outlined"
            fullWidth
            margin="normal"
            value={descriptionValue}
            onChange={onDescriptionChange}
            multiline
            rows={2}
            disabled={disabled}
          />
          {onImageChange && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={uploadingImage ? <CircularProgress size={20} /> : image ? <CheckCircle /> : <CloudUpload />}
                disabled={uploadingImage || disabled}
                color={image ? 'success' : 'primary'}
              >
                {uploadingImage ? 'Enviando...' : image ? 'Imagem Enviada' : 'Upload Imagem (Opcional)'}
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={onImageChange}
                  disabled={uploadingImage || disabled}
                />
              </Button>
              {image && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img 
                    src={`${IMAGE_BASE_URL}${image}`} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} 
                  />
                </Box>
              )}
            </Box>
          )}
        </>
      )}
    </FormControl>
  </>
);

export default FormSection;