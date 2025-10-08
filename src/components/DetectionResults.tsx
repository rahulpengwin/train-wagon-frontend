import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  LocationOn,
  Timeline,
} from '@mui/icons-material';
import { DefectDetection } from '../types';

interface DetectionResultsProps {
  detections: DefectDetection[];
}

const DetectionResults: React.FC<DetectionResultsProps> = ({ detections }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Error />;
      case 'high': return <Warning />;
      case 'medium': return <Info />;
      case 'low': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const formatDefectName = (defectType: string) => {
    return defectType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!detections || detections.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No Defects Detected
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The wagon appears to be in good condition.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
        Detected Defects
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Defect Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detections.map((detection, index) => (
              <TableRow
                key={detection.detection_id || index}
                sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${getSeverityColor(detection.severity)}.main`,
                        width: 32,
                        height: 32,
                      }}
                    >
                      {getSeverityIcon(detection.severity)}
                    </Avatar>
                    <Typography variant="subtitle2">
                      {formatDefectName(detection.defect_type)}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={detection.severity.toUpperCase()}
                    color={getSeverityColor(detection.severity) as any}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {(detection.confidence * 100).toFixed(1)}%
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      ({Math.round(detection.bounding_box.x)}, {Math.round(detection.bounding_box.y)})
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {Math.round(detection.bounding_box.width)} × {Math.round(detection.bounding_box.height)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DetectionResults;