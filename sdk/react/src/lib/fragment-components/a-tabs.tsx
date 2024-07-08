import React, { useRef } from 'react';
import {
	Tabs,
	Tab,
	TabList,
	Checkbox,
	Dropdown,
	TextInput
} from '@carbon/react';
import { AComponent, ComponentInfo } from './a-component';
import image from '../assets/component-icons/tabs.svg';
import { APlaceholder } from './a-placeholder';
import { cx } from 'emotion';
import {
	getParentComponent,
	reactClassNamesFromComponentObj,
	angularClassNamesFromComponentObj,
	nameStringToVariableString,
	updatedState
} from '../helpers/tools';
import { Adder } from '../helpers/adder';
import { DraggableTileList } from '../helpers/draggable-list';
import { TabPanel } from '@carbon/react';
import { TabPanels } from '@carbon/react';

export const ATabsSettingsUI = ({ selectedComponent, setComponent }: any) => {

	const typeItems = [
		{ id: 'line', text: 'Inline' },
		{ id: 'contained', text: 'Contained' }
	];
	const updateListItems = (key: string, value: any, index: number) => {
		const step = {
			...selectedComponent.items[index],
			[key]: value
		};

		setComponent({
			...selectedComponent,
			items: [
				...selectedComponent.items.slice(0, index),
				step,
				...selectedComponent.items.slice(index + 1)
			]
		});
	};

	const template = (item: any, index: number) => {
		return <>
			<TextInput
				id='tab-label'
				light
				value={item.labelText}
				labelText='Tab Label'
				onChange={(event: any) => {
					updateListItems('labelText', event.currentTarget.value, index);
				}} />
			<div style={{ display: 'flex', flexWrap: 'wrap' }}>
				<Checkbox
					labelText='Disabled'
					id={`disabled-${index}`}
					checked={item.disabled}
					onChange={(_: any, { checked }: any) => updateListItems('disabled', checked, index)} />
			</div>
		</>;
	};

	const updateStepList = (newList: any[]) => {
		setComponent({
			...selectedComponent,
			items: newList
		});
	};

	return <>
		<Checkbox
			labelText='Follow focus'
			id='follow-focus'
			checked={selectedComponent.isFollowFocused}
			onChange={(_: any, { checked }: any) => setComponent({
				...selectedComponent,
				isFollowFocused: checked
			})} />
		<Checkbox
			labelText='Cache active'
			id='cache-active'
			checked={selectedComponent.isCacheActive}
			onChange={(_: any, { checked }: any) => setComponent({
				...selectedComponent,
				isCacheActive: checked
			})} />
		<Checkbox
			labelText='Navigation'
			id='navigation'
			checked={selectedComponent.isNavigation}
			onChange={(_: any, { checked }: any) => setComponent({
				...selectedComponent,
				isNavigation: checked
			})} />
		<Dropdown
			id='type-dropdown'
			label=''
			titleText='Tab type'
			items={typeItems}
			selectedItem={typeItems.find(item => item.id === selectedComponent.tabType)}
			itemToString={(item: any) => (item ? item.text : '')}
			onChange={(event: any) => setComponent({
				...selectedComponent,
				tabType: event.selectedItem.id
			})} />
		<DraggableTileList
			dataList={[...selectedComponent.items]}
			setDataList={updateStepList}
			updateItem={updateListItems}
			defaultObject={{
				type: 'tab',
				labelText: 'New tab',
				disabled: false,
				items: []
			}}
			template={template} />
	</>;
};

export const ATabsCodeUI = ({ selectedComponent, setComponent }: any) => <TextInput
	id='input-name'
	value={selectedComponent.codeContext?.name}
	labelText='Input name'
	onChange={(event: any) => {
		setComponent({
			...selectedComponent,
			codeContext: {
				...selectedComponent.codeContext,
				name: event.currentTarget.value
			}
		});
	}}
/>;

export const ATabs = ({
	children,
	componentObj,
	fragment,
	setFragment,
	...rest
}: any) => {
	console.log('children ', children);
	const holderRef = useRef(null as any);
	return (
		<AComponent
			fragment={fragment}
			setFragment={setFragment}
			componentObj={componentObj}
			{...rest}>
			<Tabs className={componentObj.cssClasses?.map((cc: any) => cc.id).join(' ')}>
				<>
					<TabList aria-label='List of tabs'
					{...(componentObj.tabType !== 'line' ? { contained: true } : {})}>
						{
							componentObj.items.map((step: any, index: number) => <Tab
								onClick= {() => componentObj.selectedTab = index}
								className={cx(step.className, componentObj.cssClasses?.map((cc: any) => cc.id).join(' '))}
								disabled={step.disabled}
								key={index}>
									{step.labelText}
							</Tab>)
						}
					</TabList>
					<TabPanels>
						{
							componentObj.items.map((step: any, index: number) => {
								return <TabPanel key={index} ref={holderRef} onDrop={(event: any) => {
										event.stopPropagation();
										event.preventDefault();
										const dragObj = JSON.parse(event.dataTransfer.getData('drag-object'));
										const items = componentObj.items.map((item: any, index: any) => {
											if (index === componentObj.selectedTab) {
												return {
													...step,
													items: [
														...step.items,
														dragObj.component
													]
												};
											}
											return item;
										});
										setFragment({
											...fragment,
											data: updatedState(fragment.data, {
												type: 'update',
												component: {
													...componentObj,
													items
												}
											})
										}, false);
									}}>
									{
										step.items && step.items.length > 0
										? children.filter((child: any, index: any) => index === componentObj.selectedTab)
										: <APlaceholder componentObj={step} select={rest.select} />
									}
								</TabPanel>;
							}
							)
						}
					</TabPanels>
				</>
			</Tabs>
		</AComponent>
	);
};

export const componentInfo: ComponentInfo = {
	component: ATabs,
	settingsUI: ATabsSettingsUI,
	codeUI: ATabsCodeUI,
	render: ({ componentObj, select, selected, remove, renderComponents, outline, fragment, setFragment }) => <ATabs
	componentObj={componentObj}
	select={select}
	remove={remove}
	fragment={fragment}
	setFragment={setFragment}
	selected={selected}>
		{
			// render the child components within each tab.
			componentObj.items.map((tab: any) => {
				if (tab.items && tab.items.length > 0) {
					return tab.items.map((item: any) => {
						return renderComponents(item, outline);
					});
				}
			})
		}
	</ATabs>,
	keywords: ['tabs', 'tab'],
	name: 'Tabs',
	type: 'tabs',
	defaultComponentObj: {
		type: 'tabs',
		selectedTab: 0,
		items: [
			{
				type: 'tab',
				labelText: 'Tab 1',
				disabled: false,
				items: []
			}
		]
	},
	image,
	codeExport: {
		angular: {
			latest: {
				inputs: ({ json }) => `
					@Input() ${nameStringToVariableString(json.codeContext?.name)}FollowFocus = ${
						json.isFollowFocused ? json.isFollowFocused : false};
					@Input() ${nameStringToVariableString(json.codeContext?.name)}CacheActive = ${json.isCacheActive ? json.isCacheActive : false};
					@Input() ${nameStringToVariableString(json.codeContext?.name)}isNavigation = ${json.isNavigation ? json.isNavigation : true};
					@Input() ${nameStringToVariableString(json.codeContext?.name)}TabType: any = "${json.tabType ? json.tabType : 'contained'}";`,
				outputs: () => '',
				imports: ['TabsModule'],
				code: ({ json, fragments, jsonToTemplate, customComponentsCollections }) => {
					return `<ibm-tabs
						[type]="${nameStringToVariableString(json.codeContext?.name)}TabType"
						[cacheActive]="${nameStringToVariableString(json.codeContext?.name)}CacheActive"
						[followFocus]="${nameStringToVariableString(json.codeContext?.name)}FollowFocus"
						[isNavigation]="${nameStringToVariableString(json.codeContext?.name)}isNavigation"
						${angularClassNamesFromComponentObj(json)}>
						${json.items.map((step: any) => `<ibm-tab
							heading="${step.labelText}"
							[disabled]=${step.disabled}>
								${step.items && step.items.length > 0
									? `<section>
										${step.items.map((element: any) =>
											jsonToTemplate(element, fragments, customComponentsCollections)).join('\n')}
									</section>`
								: ''}
							</ibm-tab>`
						).join('\n')}
					</ibm-tabs>`;
				}
			},
			v10: {
				inputs: ({ json }) => `
				@Input() ${nameStringToVariableString(json.codeContext?.name)}FollowFocus = ${json.isFollowFocused ? json.isFollowFocused : false};
				@Input() ${nameStringToVariableString(json.codeContext?.name)}CacheActive = ${json.isCacheActive ? json.isCacheActive : false};
				@Input() ${nameStringToVariableString(json.codeContext?.name)}isNavigation = ${json.isNavigation ? json.isNavigation : true};
				@Input() ${nameStringToVariableString(json.codeContext?.name)}TabType: any = "${json.tabType ? json.tabType : 'contained'}";`,
				outputs: () => '',
				imports: ['TabsModule'],
				code: ({ json, fragments, jsonToTemplate, customComponentsCollections }) => {
					return `<ibm-tabs
						[type]="${nameStringToVariableString(json.codeContext?.name)}TabType"
						[cacheActive]="${nameStringToVariableString(json.codeContext?.name)}CacheActive"
						[followFocus]="${nameStringToVariableString(json.codeContext?.name)}FollowFocus"
						[isNavigation]="${nameStringToVariableString(json.codeContext?.name)}isNavigation"
						${angularClassNamesFromComponentObj(json)}>
						${json.items.map((step: any) => `<ibm-tab
							heading="${step.labelText}"
							[disabled]=${step.disabled}>
								${step.items && step.items.length > 0
									? `<section>
										${step.items.map((element: any) =>
											jsonToTemplate(element, fragments, customComponentsCollections)).join('\n')}
									</section>`
								: ''}
							</ibm-tab>`
						).join('\n')}
					</ibm-tabs>`;
				}
			}
		},
		react: {
			latest: {
				imports: ['Tabs', 'Tab'],
				code: ({ json, fragments, jsonToTemplate, customComponentsCollections }) => {
					return `${json.tabType === 'line' ?
						`<Tabs
						${reactClassNamesFromComponentObj(json)}>
						<TabList aria-label="List of tabs">
							${json.items.map((step: any, index: any) => `<Tab
								onClick={(index) => handleInputChange({
									target: {
										selectedTab: ${index}
									}
								})}
								key= {${index}}
								disabled={${step.disabled}}>
								${step.labelText}
									${step.items && step.items.length > 0
										? `<section>
											${step.items.map((element: any) =>
												jsonToTemplate(element, fragments, customComponentsCollections)).join('\n')}
										</section>`
									: ''}
								</Tab>`
							).join('\n')}
						</TabList>
					</Tabs>`: `<Tabs
						${reactClassNamesFromComponentObj(json)}>
						<TabList aria-label="List of tabs" contained>
							${json.items.map((step: any, index: any) => `<Tab
								onClick={(index) => handleInputChange({
									target: {
										selectedTab: ${index}
									}
								})}
								key= {${index}}
								disabled={${step.disabled}}>
								${step.labelText}
									${step.items && step.items.length > 0
										? `<section>
											${step.items.map((element: any) =>
												jsonToTemplate(element, fragments, customComponentsCollections)).join('\n')}
										</section>`
									: ''}
								</Tab>`
							).join('\n')}
						</TabList>
					</Tabs>`
					}`;
				}
			},
			v10: {
				imports: ['Tabs', 'Tab'],
				code: ({ json, fragments, jsonToTemplate, customComponentsCollections }) => {
					return `${json.tabType === 'line' ?
						`<Tabs
						${reactClassNamesFromComponentObj(json)}>
						<TabList aria-label="List of tabs">
							${json.items.map((step: any, index: any) => `<Tab
								onClick={(index) => handleInputChange({
									target: {
										selectedTab: ${index}
									}
								})}
								key= {${index}}
								disabled={${step.disabled}}>
								${step.labelText}
									${step.items && step.items.length > 0
										? `<section>
											${step.items.map((element: any) =>
												jsonToTemplate(element, fragments, customComponentsCollections)).join('\n')}
										</section>`
									: ''}
								</Tab>`
							).join('\n')}
						</TabList>
					</Tabs>`: `<Tabs
						${reactClassNamesFromComponentObj(json)}>
						<TabList aria-label="List of tabs" contained>
							${json.items.map((step: any, index: any) => `<Tab
								onClick={(index) => handleInputChange({
									target: {
										selectedTab: ${index}
									}
								})}
								key= {${index}}
								disabled={${step.disabled}}>
								${step.labelText}
									${step.items && step.items.length > 0
										? `<section>
											${step.items.map((element: any) =>
												jsonToTemplate(element, fragments, customComponentsCollections)).join('\n')}
										</section>`
									: ''}
								</Tab>`
							).join('\n')}
						</TabList>
					</Tabs>`
					}`;
				}
			}
		}
	}
};
