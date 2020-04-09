/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QueryDocumentNode, Utils, NodeType } from "./parser/nodes";
import { Project } from "./project";

export interface RepoInfo {
	owner: string;
	repo: string;
}

export function* getRepoInfos(doc: QueryDocumentNode, project: Project): Generator<RepoInfo> {

	Utils.print(doc, doc.text, name => project.symbols.getFirst(name)?.value);

	const repoStrings: string[] = [];

	Utils.walk(doc, node => {
		if (node._type !== NodeType.QualifiedValue) {
			return;
		}
		if (node.qualifier.value !== 'repo') {
			return;
		}

		let value: string | undefined;
		if (node.value._type === NodeType.VariableName) {
			value = project.symbols.getFirst(node.value.value)?.value;
		} else {
			value = Utils.print(node.value, doc.text, () => undefined);
		}

		if (value) {
			repoStrings.push(value);
		}
	});

	for (let string of repoStrings) {
		let idx = string.indexOf('/');
		if (idx > 0) {
			const owner = string.substring(0, idx);
			const repo = string.substring(idx + 1);
			yield { owner, repo };
		}
	}
}