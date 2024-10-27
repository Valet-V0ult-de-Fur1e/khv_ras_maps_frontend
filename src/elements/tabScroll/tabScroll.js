import React, { Component } from "react";
import "./style.css";

const reducer = (acc, e) => (e != null ? acc + e.offsetWidth : acc);
export class Tabs extends Component {
  constructor(props) {
    super(props);
    this.tilesContainerWidth = React.createRef();
    this.tabTiles = React.createRef();
    this.tilesRef = [];
    this.state = {
      selectedTab: props.selectedTab,
      tilesOverFlowRight: false,
      tilesOverFlowLeft: false,
      left: 0
    };
  }

  onTabSelection = l => {
    this.setState({ selectedTab: l });
  };

  onTabAddition = () => {
    this.reCalulateTabs();
    this.props.onTabAddition();
    console.log(this.tilesRef);
  };

  slideToNext = () => {
    const tab = this.tilesContainerWidth.offsetWidth;
    const tabsSum = this.tilesRef.reduce(reducer, 0);
    console.log(tab, tabsSum);
    this.setState({ left: tab - tabsSum });
    if (tabsSum == tab) {
      console.log("equal");
    }
  };

  slidetoPrev = () => {
    this.setState({ left: 0 });
  };
  reCalulateTabs = () => {
    const tab = this.tilesContainerWidth.offsetWidth;
    const tabsSum = this.tilesRef.reduce(reducer, 0);
    if (tabsSum + 150 > tab) {
      this.setState({ tilesOverFlowRight: true });
    } else {
      this.setState({ tilesOverFlowRight: false });
    }
  };

  deleteRef = (ref, label) => {
    this.props.deleteTab(label);
    this.tilesRef = this.tilesRef.filter(e => e != ref);
    this.reCalulateTabs();
  };
  render() {
    let l = this.state.left;
    return (
      <React.Fragment>
        <div className="tabs-wrapper">
          {this.state.tilesOverFlowRight && (
            <div
              className="add-btn right"
              style={{ float: "right" }}
              onClick={this.slideToNext}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 36 36"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d="M29.52,22.52,18,10.6,6.48,22.52a1.7,1.7,0,0,0,2.45,2.36L18,15.49l9.08,9.39a1.7,1.7,0,0,0,2.45-2.36Z" />{" "}
                <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
              </svg>
            </div>
          )}
          {this.state.left < 0 && (
            <div
              className="add-btn left"
              style={{ float: "left" }}
              onClick={this.slidetoPrev}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 36 36"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d="M29.52,22.52,18,10.6,6.48,22.52a1.7,1.7,0,0,0,2.45,2.36L18,15.49l9.08,9.39a1.7,1.7,0,0,0,2.45-2.36Z" />{" "}
                <rect x="0" y="0" width="36" height="36" fillOpacity="0" />
              </svg>
            </div>
          )}
          <div
            className="tabs-container"
            ref={el => (this.tilesContainerWidth = el)}
          >
            <div
              className="tabs-tiles"
              style={{ left: l }}
              ref={el => (this.tabTiles = el)}
            >
              {this.props.tabs.map((item, index) => {
                const { title } = item;
                let ref = React.createRef();
                return (
                  <TabTile
                    forwardRef={e => (this.tilesRef[index] = e)}
                    key={Math.random(1)}
                    label={title}
                    activeTab={this.state.selectedTab}
                    onTabClick={this.onTabSelection}
                    onDelete={this.deleteRef}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="tabs-content">
          {this.props.tabs.map(child => {
            return child.title == this.state.selectedTab
              ? child.content
              : undefined;
          })}
        </div>
      </React.Fragment>
    );
  }
}

export const TabTile = props => {
  return (
    <div
      ref={props.forwardRef}
      className={props.activeTab === props.label ? "tab active" : "tab"}
      onClick={() => props.onTabClick(props.label)}
    >
      {props.label}
    </div>
  );
};
export class TabItem {
  title = "";
  content = "";
  visible = true;
  constructor(t, c) {
    this.title = t;
    this.content = c;
  }
}
// export default Tabs TabTile;
