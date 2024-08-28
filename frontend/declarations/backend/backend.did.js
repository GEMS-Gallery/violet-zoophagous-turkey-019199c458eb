export const idlFactory = ({ IDL }) => {
  const ProjectInfo = IDL.Record({ 'id' : IDL.Nat, 'name' : IDL.Text });
  const Shape = IDL.Record({
    'x' : IDL.Float64,
    'y' : IDL.Float64,
    'id' : IDL.Nat,
    'height' : IDL.Float64,
    'color' : IDL.Text,
    'width' : IDL.Float64,
    'shapeType' : IDL.Text,
  });
  const ProjectData = IDL.Record({
    'shapes' : IDL.Vec(Shape),
    'name' : IDL.Text,
    'canvasHeight' : IDL.Float64,
    'canvasWidth' : IDL.Float64,
  });
  const Result_1 = IDL.Variant({ 'ok' : ProjectData, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  return IDL.Service({
    'getNewShapeId' : IDL.Func([], [IDL.Nat], []),
    'listProjects' : IDL.Func([], [IDL.Vec(ProjectInfo)], ['query']),
    'loadProject' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'saveProject' : IDL.Func([ProjectData], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
