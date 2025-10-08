export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DefectDetection {
  id?: number;
  detection_id?: string;
  class_id?: number;
  defect_type: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority?: number;
  bounding_box: BoundingBox;
  description?: string;
  detected_at?: string;
  detection_metadata?: {
    scale?: number;
    enhancement?: string;
    timestamp?: string;
  };
  confidence_factors?: {
    texture_factor?: number;
    contrast_factor?: number;
    size_factor?: number;
    edge_factor?: number;
    overall_factor?: number;
  };
  original_confidence?: number;
}

export interface DetectionResponse {
  inspection_id: number;
  filename: string;
  processing_time: number;
  status: string;
  detections_count: number;
  detections: DefectDetection[];
  original_image_url: string;
  annotated_image_url: string;
  quality_metrics?: {
    quality_score?: string;
    performance_level?: string;
    confidence_stats?: {
      average: number;
      minimum: number;
      maximum: number;
    };
  };
  model_info?: {
    architecture?: string;
    gpu_memory?: string;
    cuda_cores?: string;
    precision?: string;
  };
  enhanced_accuracy_mode?: boolean;
  severity_breakdown?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  confidence_statistics?: {
    average_confidence: number;
    min_confidence: number;
    max_confidence: number;
  };
}