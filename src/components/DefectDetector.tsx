import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  FormControlLabel,
  Switch,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  PhotoCamera,
  Assessment,
  Speed,
  Memory,
  Download,
  GetApp,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { apiService } from '../services/api';
import { DetectionResponse } from '../types';
import DetectionResults from './DetectionResults';
import ImageComparison from './ImageComparison';

const DefectDetector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [enhancedAccuracy, setEnhancedAccuracy] = useState(true);
  const [highPrecision, setHighPrecision] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState<{ original: boolean; annotated: boolean }>({
    original: false,
    annotated: false,
  });
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setDetectionResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    multiple: false,
    maxSize: 52428800,
  });

  const handleDetection = async () => {
    if (!selectedFile) {
      setError('Please select an image file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.uploadAndDetect(
        selectedFile,
        enhancedAccuracy,
        highPrecision
      );
      setDetectionResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  // Download image function
  const downloadImage = async (imageUrl: string, filename: string, type: 'original' | 'annotated') => {
    try {
      setDownloadLoading(prev => ({ ...prev, [type]: true }));
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadSuccess(`${type === 'original' ? 'Original' : 'Annotated'} image downloaded successfully!`);
    } catch (err: any) {
      setError(`Download failed: ${err.message}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Generate download filename
  const getDownloadFilename = (type: 'original' | 'annotated') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const baseName = selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'wagon-image';
    const suffix = type === 'original' ? 'original' : 'defects-detected';
    return `${baseName}-${suffix}-${timestamp}.jpg`;
  };

  // Download both images
  const downloadBothImages = async () => {
    if (!detectionResult) return;
    
    try {
      await Promise.all([
        downloadImage(
          detectionResult.original_image_url,
          getDownloadFilename('original'),
          'original'
        ),
        downloadImage(
          detectionResult.annotated_image_url,
          getDownloadFilename('annotated'),
          'annotated'
        ),
      ]);
      setDownloadSuccess('Both images downloaded successfully!');
    } catch (err: any) {
      setError(`Batch download failed: ${err.message}`);
    }
  };

  return (
    <Box>
      {/* Upload Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <PhotoCamera sx={{ mr: 1, verticalAlign: 'middle' }} />
          Upload Wagon Image
        </Typography>
        
        {/* Settings */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={enhancedAccuracy}
                onChange={(e) => setEnhancedAccuracy(e.target.checked)}
                color="primary"
              />
            }
            label="Enhanced Accuracy Mode (Multi-stage filtering)"
          />
          <FormControlLabel
            control={
              <Switch
                checked={highPrecision}
                onChange={(e) => setHighPrecision(e.target.checked)}
                color="primary"
              />
            }
            label="High Precision Mode (GPU optimized)"
          />
        </Stack>

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          {isDragActive ? (
            <Typography variant="h6">Drop the image here...</Typography>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Drag & drop a wagon image here, or click to select
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: JPEG, PNG, BMP, TIFF (max 50MB)
              </Typography>
            </>
          )}
        </Box>

        {/* Preview */}
        {previewUrl && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview:
            </Typography>
            <Card sx={{ maxWidth: 400, mx: 'auto' }}>
              <CardMedia
                component="img"
                height="300"
                image={previewUrl}
                alt="Preview"
                sx={{ objectFit: 'contain' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)}KB)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Detect Button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleDetection}
            disabled={!selectedFile || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Detecting Defects...' : 'Start Defect Detection'}
          </Button>
        </Box>
      </Paper>

      {/* Loading */}
      {loading && (
        <Paper elevation={3} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            🔬 AI Detection in Progress
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyzing wagon image with enhanced YOLO v11 technology
          </Typography>
          <LinearProgress sx={{ mt: 2, height: 8, borderRadius: 4 }} />
        </Paper>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {detectionResult && (
        <Box>
          {/* Summary Card with Download Options */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                Detection Summary
              </Typography>
              
              {/* Download Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => downloadImage(
                    detectionResult.original_image_url,
                    getDownloadFilename('original'),
                    'original'
                  )}
                  disabled={downloadLoading.original}
                  startIcon={downloadLoading.original ? <CircularProgress size={16} /> : <Download />}
                  sx={{ minWidth: 140 }}
                >
                  {downloadLoading.original ? 'Downloading...' : 'Download Original'}
                </Button>
                
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => downloadImage(
                    detectionResult.annotated_image_url,
                    getDownloadFilename('annotated'),
                    'annotated'
                  )}
                  disabled={downloadLoading.annotated}
                  startIcon={downloadLoading.annotated ? <CircularProgress size={16} /> : <GetApp />}
                  sx={{ minWidth: 140 }}
                >
                  {downloadLoading.annotated ? 'Downloading...' : 'Download Results'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={downloadBothImages}
                  disabled={downloadLoading.original || downloadLoading.annotated}
                  startIcon={<Download />}
                  sx={{ minWidth: 120 }}
                >
                  Download Both
                </Button>
              </Stack>
            </Box>
            
            {/* Summary Cards */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ 
                flexWrap: 'wrap',
                '& > *': {
                  flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }
                }
              }}
            >
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="primary">
                  {detectionResult.detections_count}
                </Typography>
                <Typography variant="body2">Defects Found</Typography>
              </Card>

              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" color="secondary">
                  {detectionResult.processing_time}s
                </Typography>
                <Typography variant="body2">Processing Time</Typography>
              </Card>

              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Speed sx={{ fontSize: 40, color: 'success.main' }} />
                <Typography variant="body2">GPU Optimized</Typography>
              </Card>

              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Memory sx={{ fontSize: 40, color: 'info.main' }} />
                <Typography variant="body2">Enhanced Accuracy</Typography>
              </Card>
            </Stack>

            {/* Download Info */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                💡 <strong>Download Tips:</strong> 
                Original image preserves the uploaded quality. 
                Results image shows detected defects with colored bounding boxes and confidence scores.
                Both images are automatically timestamped for easy identification.
              </Typography>
            </Box>
          </Paper>

          {/* Image Comparison with Download */}
          <ImageComparison
            originalUrl={detectionResult.original_image_url}
            annotatedUrl={detectionResult.annotated_image_url}
            onDownloadOriginal={() => downloadImage(
              detectionResult.original_image_url,
              getDownloadFilename('original'),
              'original'
            )}
            onDownloadAnnotated={() => downloadImage(
              detectionResult.annotated_image_url,
              getDownloadFilename('annotated'),
              'annotated'
            )}
            downloadLoading={downloadLoading}
          />

          {/* Detection Results */}
          <DetectionResults detections={detectionResult.detections} />
        </Box>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!downloadSuccess}
        autoHideDuration={4000}
        onClose={() => setDownloadSuccess('')}
        message={downloadSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default DefectDetector;