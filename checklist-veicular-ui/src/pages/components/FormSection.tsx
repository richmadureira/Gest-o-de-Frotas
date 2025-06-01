import React from 'react';
import { Paper, Divider, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Button } from '@mui/material';

interface FormSectionProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string | undefined;
  options: { value: string; label: string }[];
  description?: { condition: string };
  descriptionValue?: string;
  onDescriptionChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  image?: File | null;
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
}: FormSectionProps) => (
  <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
    <Divider textAlign="left">
      <Typography variant="h6" color="primary">
        {title}
      </Typography>
    </Divider>
    <FormControl component="fieldset" fullWidth margin="normal" error={!!error}>
      <FormLabel component="legend">{title}</FormLabel>
      <RadioGroup value={value} onChange={onChange} row>
        {options.map((option) => (
          <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
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
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload Imagem
            <input
              type="file"
              hidden
              onChange={onImageChange}
            />
          </Button>
          {image && <Typography variant="body2" sx={{ mt: 1 }}>{image.name}</Typography>}
        </>
      )}
    </FormControl>
  </Paper>
);

export default FormSection;