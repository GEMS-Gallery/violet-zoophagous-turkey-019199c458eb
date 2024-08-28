import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Paper, Box, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { backend } from 'declarations/backend';

type Shape = {
  id: number;
  shapeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentShape, setCurrentShape] = useState<string>('rectangle');
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawShapes();
  }, [shapes, selectedShape, canvasSize]);

  const drawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
      ctx.fillStyle = shape.color;
      if (shape.shapeType === 'rectangle') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.shapeType === 'circle') {
        ctx.beginPath();
        ctx.arc(
          shape.x + shape.width / 2,
          shape.y + shape.height / 2,
          Math.min(shape.width, shape.height) / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      if (selectedShape && selectedShape.id === shape.id) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
      }
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedShape = shapes.find(shape =>
      x >= shape.x && x <= shape.x + shape.width &&
      y >= shape.y && y <= shape.y + shape.height
    );

    if (clickedShape) {
      setSelectedShape(clickedShape);
      setIsDrawing(false);
    } else {
      setIsDrawing(true);
      setStartPoint({ x, y });
      setSelectedShape(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && startPoint) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawShapes();

      ctx.fillStyle = currentColor;
      if (currentShape === 'rectangle') {
        ctx.fillRect(
          startPoint.x,
          startPoint.y,
          x - startPoint.x,
          y - startPoint.y
        );
      } else if (currentShape === 'circle') {
        const radius = Math.min(
          Math.abs(x - startPoint.x),
          Math.abs(y - startPoint.y)
        ) / 2;
        ctx.beginPath();
        ctx.arc(
          startPoint.x + (x - startPoint.x) / 2,
          startPoint.y + (y - startPoint.y) / 2,
          radius,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    } else if (selectedShape) {
      const updatedShapes = shapes.map(shape =>
        shape.id === selectedShape.id
          ? { ...shape, x: x - shape.width / 2, y: y - shape.height / 2 }
          : shape
      );
      setShapes(updatedShapes);
      setSelectedShape({ ...selectedShape, x: x - selectedShape.width / 2, y: y - selectedShape.height / 2 });
    }

    // Check if we need to resize the canvas
    const margin = 50;
    if (x > canvasSize.width - margin || y > canvasSize.height - margin) {
      setCanvasSize({
        width: Math.max(canvasSize.width, x + margin),
        height: Math.max(canvasSize.height, y + margin)
      });
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && startPoint) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const shapeId = await backend.getNewShapeId();
      const newShape: Shape = {
        id: shapeId,
        shapeType: currentShape,
        x: startPoint.x,
        y: startPoint.y,
        width: x - startPoint.x,
        height: y - startPoint.y,
        color: currentColor,
      };

      setShapes([...shapes, newShape]);
      setIsDrawing(false);
      setStartPoint(null);
    }
  };

  const handleSave = async () => {
    try {
      const projectData = {
        name: 'My Project',
        shapes: shapes.map((shape) => ({
          ...shape,
          x: Number(shape.x),
          y: Number(shape.y),
          width: Number(shape.width),
          height: Number(shape.height),
        })),
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
      };
      const result = await backend.saveProject(projectData);
      console.log('Project saved:', result);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleLoad = async () => {
    try {
      const result = await backend.listProjects();
      console.log('Projects:', result);
      // Implement project selection and loading logic here
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleDeleteShape = () => {
    if (selectedShape) {
      const updatedShapes = shapes.filter(shape => shape.id !== selectedShape.id);
      setShapes(updatedShapes);
      setSelectedShape(null);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Home Construction Visualizer
          </Typography>
          <Button color="inherit" onClick={handleSave}>Save</Button>
          <Button color="inherit" onClick={handleLoad}>Load</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant={currentShape === 'rectangle' ? 'contained' : 'outlined'}
              onClick={() => setCurrentShape('rectangle')}
              sx={{ mr: 1 }}
            >
              Rectangle
            </Button>
            <Button
              variant={currentShape === 'circle' ? 'contained' : 'outlined'}
              onClick={() => setCurrentShape('circle')}
            >
              Circle
            </Button>
            <IconButton onClick={handleDeleteShape} disabled={!selectedShape}>
              <DeleteIcon />
            </IconButton>
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
            />
          </Box>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ border: '1px solid #000' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDrawing(false)}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default App;
