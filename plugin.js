const push = (a, b) => a.push.apply(a, b)

const getLocalSpecifierIdentifiers = (t, path) => {
    const identifiers = []
    const getLocalIdentifiers = path => {
        const local = path.node.local
        if (t.isIdentifier(local)) identifiers.push(local)
    }
    path.traverse({
        ImportDefaultSpecifier: getLocalIdentifiers,
        ImportSpecifier: getLocalIdentifiers,
        ImportNamespaceSpecifier: getLocalIdentifiers
    })
    return identifiers
}

const getAndRemoveImportedIdentifiers = (t, path) => {
    const identifiers = []
    path.traverse({
        ImportDeclaration(path) {
            push(identifiers, getLocalSpecifierIdentifiers(t, path))
            path.remove()
        }
    })
    return identifiers
}

export default function({ types: t }) {
    return {
        visitor: {
            Program: function(path) {
                const imports = getAndRemoveImportedIdentifiers(t, path)
                // console.log(imports)
                path.node.body = [
                    t.functionDeclaration(
                        t.identifier("wrapper"),
                        imports,
                        t.blockStatement([])
                    )
                ]
            }
        }
    }
}
