import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Paper, Box, TextField } from '@mui/material';
import { backend } from 'declarations/backend';

type Shape = {
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawShapes();
  }, [shapes]);

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
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newShape: Shape = {
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
            width={800}
            height={600}
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
