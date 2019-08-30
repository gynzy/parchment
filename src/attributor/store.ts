import Attributor from './attributor';
import ClassAttributor from './class';
import StyleAttributor from './style';
import { Formattable } from '../blot/abstract/blot';
import * as Registry from '../registry';
import InlineBlot from '../blot/inline';
import BlockBlot from '../blot/block';

class AttributorStore {
  private attributes: { [key: string]: Attributor } = {};
  private domNode: HTMLElement;

  constructor(domNode: HTMLElement) {
    this.domNode = domNode;
    this.build();
  }

  attribute(attribute: Attributor, value: any): void {
    // verb
    if (value) {
      if (attribute.add(this.domNode, value)) {
        if (attribute.value(this.domNode) != null) {
          this.attributes[attribute.attrName] = attribute;
        } else {
          delete this.attributes[attribute.attrName];
        }
      }
    } else {
      attribute.remove(this.domNode);
      delete this.attributes[attribute.attrName];
    }
  }

  build(): {key: string, value: string | boolean}[] {
    this.attributes = {};
    let attributes = Attributor.keys(this.domNode);
    let classes = ClassAttributor.keys(this.domNode);
    let styles = StyleAttributor.keys(this.domNode);
    let incorrectScoped: {key: string, value: string | boolean}[] = [];
    attributes
      .concat(classes)
      .concat(styles)
      .forEach(name => {
        let attr: Attributor = <Attributor>Registry.query(name, Registry.Scope.ATTRIBUTE);
        if (attr !== null && attr instanceof Attributor) {

          // begin: custom step during building the attributor store

          // attributes added by browser(webkit) but not supported by quill's own formatting need to be translated
          let origFormatNames: string[] | boolean = typeof attr.attrName === 'string' && attr.attrName.split('-<alt>');
          if ( origFormatNames && origFormatNames.length > 1) {
            origFormatNames[0].split('-').forEach((name, i, arr) => {
              let value = attr.value(this.domNode, true);
              if (i === arr.length - 1) attr.remove(this.domNode);

              let level: Attributor | Registry.BlotConstructor | null = <Attributor | null>Registry.query(name, Registry.Scope.ATTRIBUTE);
              if (level !== null) {
                let key: string = level.keyName;
                value = attr.classList && attr.classList[value] || value;
                return incorrectScoped.push({key, value});
              }

              level = <Registry.BlotConstructor | null>Registry.query(name, Registry.Scope.BLOT);
              if (level) {
                let key: string = level.blotName;
                return incorrectScoped.push({key, value});
              }
            })
          }

          // attributes that are incorrectly scoped need to be re-applied
          if (attr.value(this.domNode) === '') {
            const value = attr.value(this.domNode, true);
            attr.remove(this.domNode);
            return incorrectScoped.push({key: attr.keyName, value});
          }
          // end

          this.attributes[attr.attrName] = attr;
        }
      });
    return incorrectScoped;
  }

  copy(target: Formattable): void {
    Object.keys(this.attributes).forEach(key => {
      let value = this.attributes[key].value(this.domNode);
      target.format(key, value);
    });
  }

  move(target: Formattable): void {
    this.copy(target);
    Object.keys(this.attributes).forEach(key => {
      this.attributes[key].remove(this.domNode);
    });
    this.attributes = {};
  }

  values(): { [key: string]: any } {
    return Object.keys(
      this.attributes,
    ).reduce((attributes: { [key: string]: any }, name: string) => {
      attributes[name] = this.attributes[name].value(this.domNode);
      return attributes;
    }, {});
  }
}

export default AttributorStore;
