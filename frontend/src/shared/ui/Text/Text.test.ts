import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Text from './Text.vue';

describe('Text Component', () => {
  // Test rendering with default props
  it('renders with default props', () => {
    const content = 'Hello, world!';
    const wrapper = mount(Text, {
      props: { content }
    });
    
    // Check if the component renders
    expect(wrapper.exists()).toBe(true);
    
    // Check if the content is rendered correctly
    expect(wrapper.text()).toBe(content);
    
    // Check if the default classes are applied
    const element = wrapper.find('p');
    expect(element.classes()).toContain('text');
    expect(element.classes()).toContain('text--size-medium');
    expect(element.classes()).toContain('text--weight-normal');
    expect(element.classes()).toContain('text--color-default');
  });
  
  // Test different sizes
  it('applies the correct size class', async () => {
    const sizes = ['small', 'medium', 'large'];
    
    for (const size of sizes) {
      const wrapper = mount(Text, {
        props: { 
          content: 'Test',
          size
        }
      });
      
      const element = wrapper.find('p');
      expect(element.classes()).toContain(`text--size-${size}`);
    }
  });
  
  // Test different weights
  it('applies the correct weight class', async () => {
    const weights = ['normal', 'bold'];
    
    for (const weight of weights) {
      const wrapper = mount(Text, {
        props: { 
          content: 'Test',
          weight
        }
      });
      
      const element = wrapper.find('p');
      expect(element.classes()).toContain(`text--weight-${weight}`);
    }
  });
  
  // Test different colors
  it('applies the correct color class', async () => {
    const colors = ['default', 'primary', 'secondary', 'error'];
    
    for (const color of colors) {
      const wrapper = mount(Text, {
        props: { 
          content: 'Test',
          color
        }
      });
      
      const element = wrapper.find('p');
      expect(element.classes()).toContain(`text--color-${color}`);
    }
  });
  
  // Test prop validation
  it('validates size prop correctly', () => {
    const validSizes = ['small', 'medium', 'large'];
    const invalidSize = 'invalid-size';
    
    // Check valid sizes
    for (const size of validSizes) {
      const validator = Text.props.size.validator;
      expect(validator(size)).toBe(true);
    }
    
    // Check invalid size
    const validator = Text.props.size.validator;
    expect(validator(invalidSize)).toBe(false);
  });
  
  // Test weight prop validation
  it('validates weight prop correctly', () => {
    const validWeights = ['normal', 'bold'];
    const invalidWeight = 'invalid-weight';
    
    // Check valid weights
    for (const weight of validWeights) {
      const validator = Text.props.weight.validator;
      expect(validator(weight)).toBe(true);
    }
    
    // Check invalid weight
    const validator = Text.props.weight.validator;
    expect(validator(invalidWeight)).toBe(false);
  });
  
  // Test color prop validation
  it('validates color prop correctly', () => {
    const validColors = ['default', 'primary', 'secondary', 'error'];
    const invalidColor = 'invalid-color';
    
    // Check valid colors
    for (const color of validColors) {
      const validator = Text.props.color.validator;
      expect(validator(color)).toBe(true);
    }
    
    // Check invalid color
    const validator = Text.props.color.validator;
    expect(validator(invalidColor)).toBe(false);
  });
});