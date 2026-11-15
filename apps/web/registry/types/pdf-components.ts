/** CSS-like style object compatible with both Takumi and Forme */
export type Style = Record<string, unknown>;

/**
 * Base props shared by all pdfcn PDF components. Children arrive through
 * content projection.
 */
export interface PDFComponentProps {
  style?: Style;
}
