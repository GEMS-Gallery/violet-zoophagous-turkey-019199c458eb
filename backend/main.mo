import Hash "mo:base/Hash";
import List "mo:base/List";

import Array "mo:base/Array";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Iter "mo:base/Iter";

actor {
  // Types
  type Shape = {
    id: Nat;
    shapeType: Text;
    x: Float;
    y: Float;
    width: Float;
    height: Float;
    color: Text;
  };

  type ProjectData = {
    name: Text;
    shapes: [Shape];
    canvasWidth: Float;
    canvasHeight: Float;
  };

  type ProjectInfo = {
    id: Nat;
    name: Text;
  };

  // Stable variables
  stable var nextProjectId: Nat = 0;
  stable var nextShapeId: Nat = 0;
  stable var projectsEntries: [(Nat, ProjectData)] = [];

  // Initialize HashMap from stable variable
  let projects = HashMap.fromIter<Nat, ProjectData>(projectsEntries.vals(), 0, Nat.equal, Nat.hash);

  // Save project
  public func saveProject(projectData: ProjectData): async Result.Result<Nat, Text> {
    let projectId = nextProjectId;
    nextProjectId += 1;
    projects.put(projectId, projectData);
    #ok(projectId)
  };

  // Load project
  public query func loadProject(projectId: Nat): async Result.Result<ProjectData, Text> {
    switch (projects.get(projectId)) {
      case (null) { #err("Project not found") };
      case (?project) { #ok(project) };
    }
  };

  // List projects
  public query func listProjects(): async [ProjectInfo] {
    Iter.toArray(Iter.map<(Nat, ProjectData), ProjectInfo>(
      projects.entries(),
      func((id, project)) : ProjectInfo {
        { id = id; name = project.name }
      }
    ))
  };

  // Generate new shape ID
  public func getNewShapeId(): async Nat {
    let shapeId = nextShapeId;
    nextShapeId += 1;
    shapeId
  };

  // System functions for upgrades
  system func preupgrade() {
    projectsEntries := Iter.toArray(projects.entries());
  };

  system func postupgrade() {
    projectsEntries := [];
  };
}
