// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * CrossStackReferences
 * 
 * This class is used to store references to resources that need to be accessed
 * across stacks. It helps avoid circular dependencies by providing a central
 * place to store and retrieve references.
 */
export class CrossStackReferences extends Construct {
  // Store references as static properties so they can be accessed without an instance
  private static instance: CrossStackReferences;
  private static references: Record<string, any> = {};

  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    if (CrossStackReferences.instance) {
      throw new Error('CrossStackReferences is a singleton and can only be instantiated once');
    }
    
    CrossStackReferences.instance = this;
  }

  /**
   * Store a reference to a resource
   * @param key Unique identifier for the resource
   * @param value The resource reference to store
   */
  public static setReference(key: string, value: any): void {
    this.references[key] = value;
  }

  /**
   * Get a reference to a resource
   * @param key Unique identifier for the resource
   * @returns The resource reference
   */
  public static getReference(key: string): any {
    if (!this.references[key]) {
      throw new Error(`Reference with key "${key}" not found`);
    }
    return this.references[key];
  }

  /**
   * Check if a reference exists
   * @param key Unique identifier for the resource
   * @returns True if the reference exists, false otherwise
   */
  public static hasReference(key: string): boolean {
    return !!this.references[key];
  }
}
