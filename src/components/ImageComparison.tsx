import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardMedia,
  Stack,
  Button,
  CircularProgress,
  CardActions,
} from '@mui/material';
import {
  Image,
  BugReport,
  CompareArrows,
  Download,
  GetApp,
} from '@mui/icons-material';

interface ImageComparisonProps {
  originalUrl: string;
  annotatedUrl: string;
  onDownloadOriginal?: () => void;
  onDownloadAnnotated?: () => void;
  downloadLoading?: { original: boolean; annotated: boolean };
}

const ImageComparison: React.FC<ImageComparisonProps> = ({ 
  originalUrl, 
  annotatedUrl, 
  onDownloadOriginal,
  onDownloadAnnotated,
  downloadLoading = { original: false, annotated: false }
}) => {
  const [view, setView] = useState<'original' | 'annotated' | 'both'>('both');

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'original' | 'annotated' | 'both'
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const imageStyle = {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'contain' as const,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
          Image Comparison
        </Typography>
        
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="original">
            <Image sx={{ mr: 1 }} />
            Original
          </ToggleButton>
          <ToggleButton value="annotated">
            <BugReport sx={{ mr: 1 }} />
            Annotated
          </ToggleButton>
          <ToggleButton value="both">
            <CompareArrows sx={{ mr: 1 }} />
            Both
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'both' ? (
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2}
          sx={{
            '& > *': {
              flex: { xs: '1 1 100%', md: '1 1 50%' }
            }
          }}
        >
          <Card elevation={2}>
            <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
              <Image sx={{ mr: 1, verticalAlign: 'middle' }} />
              Original Image
            </Typography>
            <CardMedia
              component="img"
              image={originalUrl}
              alt="Original wagon image"
              sx={imageStyle}
            />
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onDownloadOriginal}
                disabled={downloadLoading.original}
                startIcon={downloadLoading.original ? <CircularProgress size={16} /> : <Download />}
              >
                {downloadLoading.original ? 'Downloading...' : 'Download'}
              </Button>
            </CardActions>
          </Card>

          <Card elevation={2}>
            <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
              <BugReport sx={{ mr: 1, verticalAlign: 'middle' }} />
              Annotated Image
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
                (with defect bounding boxes)
              </Typography>
            </Typography>
            <CardMedia
              component="img"
              image={annotatedUrl}
              alt="Annotated wagon image"
              sx={imageStyle}
            />
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={onDownloadAnnotated}
                disabled={downloadLoading.annotated}
                startIcon={downloadLoading.annotated ? <CircularProgress size={16} /> : <GetApp />}
              >
                {downloadLoading.annotated ? 'Downloading...' : 'Download Results'}
              </Button>
            </CardActions>
          </Card>
        </Stack>
      ) : (
        <Card elevation={2}>
          <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
            {view === 'original' ? (
              <>
                <Image sx={{ mr: 1, verticalAlign: 'middle' }} />
                Original Image
              </>
            ) : (
              <>
                <BugReport sx={{ mr: 1, verticalAlign: 'middle' }} />
                Annotated Image
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
                  (with defect bounding boxes)
                </Typography>
              </>
            )}
          </Typography>
          <CardMedia
            component="img"
            image={view === 'original' ? originalUrl : annotatedUrl}
            alt={view === 'original' ? 'Original wagon image' : 'Annotated wagon image'}
            sx={imageStyle}
          />
          <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              variant={view === 'original' ? 'outlined' : 'contained'}
              size="small"
              onClick={view === 'original' ? onDownloadOriginal : onDownloadAnnotated}
              disabled={view === 'original' ? downloadLoading.original : downloadLoading.annotated}
              startIcon={(view === 'original' ? downloadLoading.original : downloadLoading.annotated) ? 
                <CircularProgress size={16} /> : 
                (view === 'original' ? <Download /> : <GetApp />)
              }
            >
              {(view === 'original' ? downloadLoading.original : downloadLoading.annotated) ? 
                'Downloading...' : 
                (view === 'original' ? 'Download Original' : 'Download Results')
              }
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Download Instructions */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 2, color: 'info.contrastText' }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          📥 <strong>Download Information:</strong>
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          • <strong>Original Image:</strong> High-quality source image as uploaded<br/>
          • <strong>Results Image:</strong> Annotated with colored defect detection boxes and confidence scores<br/>
          • <strong>File Names:</strong> Auto-generated with timestamps for easy organization
        </Typography>
      </Box>
    </Paper>
  );
};

export default ImageComparison;