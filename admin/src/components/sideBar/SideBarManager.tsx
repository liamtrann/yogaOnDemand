import React, {ReactNode, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {connect} from "react-redux";
import {IStore} from "../../redux/defaultStore";
import Sidebar from "react-sidebar";
import {toggleSideBar} from "../../redux/meta/MetaActions";
import {FiMenu, FiX} from "react-icons/all";
import SideBarInner from "./SideBarInner";

interface IProps {
	dispatch?: any;
	sideBarOpen?: boolean;
	children: ReactNode;
}

interface ISideBarConfig {
	sideBarDocked: boolean;
	sideBarOpen: boolean;
}

// See sideBar.scss file where this matching value is used as well
const sideBarMediaQueryList: MediaQueryList = window.matchMedia("(min-width: 992px)");

// page routes where the sidebar should not be accessible
const hiddenPages: string[] = ["/", "/404"];

const SideBarManager: React.FC<IProps> = (props: IProps) => {

	let location = useLocation();

	const [sideBarConfig, setSideBarConfig] = useState<ISideBarConfig>({
		sideBarDocked: sideBarMediaQueryList.matches,
		sideBarOpen: props.sideBarOpen === true,
	});

	/**
	 * Respond to the sideBarOpen value in redux,
	 * and then toggle the local variable when it changes
	 *
	 */
	useEffect(() => {
		onSetSideBarOpen(props.sideBarOpen === true);
	}, [props.sideBarOpen]);

	/**
	 * Add & remove the listener on mount & unmount for the media query list
	 * (for checking screen width)
	 *
	 */
	useEffect(() => {
		sideBarMediaQueryList.addListener(onMediaQueryChange);
		return () => {
			sideBarMediaQueryList.removeListener(onMediaQueryChange)
		}
	}, []);

	/**
	 * Toggle the local state variable of the side bar being open or closed
	 *
	 */
	function onSetSideBarOpen(open: boolean): void {
		setSideBarConfig({
			...sideBarConfig,
			sideBarOpen: open,
		});
	}

	/**
	 * Handler for when the screen size changes
	 *
	 */
	function onMediaQueryChange(): void {
		setSideBarConfig({
			sideBarDocked: sideBarMediaQueryList.matches,
			sideBarOpen: false,
		});
	}

	/**
	 * Dispatch redux action to toggle the open status of the side bar,
	 * where it is tracked instead of locally
	 *
	 */
	function toggleSideBarHelper(e): void {
		if (e) {
			e.preventDefault();
		}

		props.dispatch(toggleSideBar(!props.sideBarOpen));
	}

	if (hiddenPages.includes(location.pathname)) {
		return (<React.Fragment>{props.children}</React.Fragment>);
	}

	return (
		<div>
			<Sidebar
				sidebar={(
					<div className="sidebar bg-dark p-3">
						{!sideBarConfig.sideBarDocked && (
							<div className="d-flex justify-content-end mb-2">
								<a href="#" onClick={toggleSideBarHelper} className="text-light">
									<FiX size="1.5rem" style={{maxHeight: 55}}/>
								</a>
							</div>
						)}
						<SideBarInner/>
					</div>
				)}
				open={sideBarConfig.sideBarOpen}
				docked={sideBarConfig.sideBarDocked}
				onSetOpen={toggleSideBarHelper}
			>
				<div className="sidebar-header-toggle-icon d-flex justify-content-end p-3">
					<a href="#" onClick={toggleSideBarHelper} className="text-dark">
						<FiMenu size="1.5rem" style={{maxHeight: 55}}/>
					</a>
				</div>
				{props.children}
			</Sidebar>
		</div>
	)
};

export default connect((store: IStore, props: IProps) => {
	return {
		...props,
		sideBarOpen: store.metaStore.sidebarVisible,
	}
})(SideBarManager);
