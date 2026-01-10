import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: React.DetailedHTMLProps<any, any>;
      group: React.DetailedHTMLProps<any, any>;
      boxGeometry: React.DetailedHTMLProps<any, any>;
      cylinderGeometry: React.DetailedHTMLProps<any, any>;
      torusGeometry: React.DetailedHTMLProps<any, any>;
      sphereGeometry: React.DetailedHTMLProps<any, any>;
      planeGeometry: React.DetailedHTMLProps<any, any>;
      meshStandardMaterial: React.DetailedHTMLProps<any, any>;
      meshBasicMaterial: React.DetailedHTMLProps<any, any>;
      meshPhongMaterial: React.DetailedHTMLProps<any, any>;
      meshLambertMaterial: React.DetailedHTMLProps<any, any>;
      pointLight: React.DetailedHTMLProps<any, any>;
      ambientLight: React.DetailedHTMLProps<any, any>;
      directionalLight: React.DetailedHTMLProps<any, any>;
      spotLight: React.DetailedHTMLProps<any, any>;
      hemisphereLight: React.DetailedHTMLProps<any, any>;
      [elemName: string]: any;
    }
  }
}
