import TS, {
    JsxAttribute,
    Node,
    Block,
    JsxAttributes,
    Expression,
    NodeFactory,
    factory
  } from 'typescript';

export function fixJSXElementUIDs(
    oldElement: any,
    newElement: any,
) {
    if (oldElement) {
        if (oldElement.tagName === newElement.tagName) {
            if (oldElement.uid !== newElement.uid) {
                newElement.uid = oldElement.uid || newElement.uid;
                updateUID(oldElement.uid || newElement.uid, newElement)
            }
            newElement.children = fixArrayElements(oldElement.children, newElement.children);
        } else {
            return newElement;
        }
    }
    return newElement; 
}

function updateUID(
    uid: string,
    node: any
) {
    const properties: Array<JsxAttribute> = (node as any).linkAttributes.properties;
    if (Array.isArray(properties)) {
        const propIndex = properties.findIndex(property => {
            return (property.name as any).escapedText === 'data-uid'
        });
        if (propIndex>=0) {
            properties.splice(propIndex, 1);
        }
        properties.push(
            TS.factory.createJsxAttribute(TS.factory.createIdentifier('data-uid'), TS.factory.createStringLiteral(uid)))
    }
}

function fixArrayElements<T>(
    oldElements: Array<any>,
    newElements: Array<any>,
) {
    let oldElementIndexesUsed: Set<number> = new Set();
    let workingArray: Array<T> = [];
    newElements.forEach((newElement, newElementIndex) => {
        const uid = newElement.uid;
        let possibleOldElement: T | undefined = undefined;

        if (!oldElements) {
            workingArray[newElementIndex] = newElement;
        } else {
            oldElements.forEach((oldElement, oldElementIndex) => {
                const oldUid = oldElement.uid;
                if (oldUid === uid) {
                    possibleOldElement = oldElement
                    oldElementIndexesUsed.add(oldElementIndex)
                }
            })
        }

        if (possibleOldElement != null) {
            workingArray[newElementIndex] = fixJSXElementUIDs(possibleOldElement, newElement)
        }
    })

    return newElements.map((newElement, newElementIndex) => {
        if (newElementIndex in workingArray) {
            return workingArray[newElementIndex]
        } else if (!oldElementIndexesUsed.has(newElementIndex)) {
            const oldElement = oldElements?.[newElementIndex];
            return fixJSXElementUIDs(oldElement, newElement)
        } else {
            return fixJSXElementUIDs(newElement, newElement)
        }
    })
}


export function fixParseSuccessUIDs(
    oldParse: any,
    newParse: any,
    alreadyExistingUIDs?: Set<string>,
    uidsExpectedToBeSeen?: Set<string>,
) {
    // if (!oldParse) return;
    return fixArrayElements(oldParse, newParse);
}