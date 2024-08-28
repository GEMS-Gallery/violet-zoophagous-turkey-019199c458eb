import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ProjectData { 'shapes' : Array<Shape>, 'name' : string }
export interface ProjectInfo { 'id' : bigint, 'name' : string }
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Result_1 = { 'ok' : ProjectData } |
  { 'err' : string };
export interface Shape {
  'x' : number,
  'y' : number,
  'height' : number,
  'color' : string,
  'width' : number,
  'shapeType' : string,
}
export interface _SERVICE {
  'listProjects' : ActorMethod<[], Array<ProjectInfo>>,
  'loadProject' : ActorMethod<[bigint], Result_1>,
  'saveProject' : ActorMethod<[ProjectData], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
