import React, { Component } from 'react';
import { registerComponent, Components, getSetting } from 'meteor/vulcan:core';
import PropTypes from 'prop-types';
import { InstantSearch, SearchBox } from 'react-instantsearch/dom';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Icon from '@material-ui/core/Icon'

const styles = theme => ({
  searchBar: {
    display: "inline-block",
    position: "relative",
    "& .ais-SearchBox__submit":{
      display: "none"
    },
    "& .ais-SearchBox__input": {
      paddingRight: 0,
      paddingLeft: 48,
      verticalAlign: "bottom",
      borderStyle: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      width:0,
    },
    "&.open .ais-SearchBox__input": {
      cursor: "text",
      width: "100%",
      borderRadius:5,
      [theme.breakpoints.down('tiny')]: {
        backgroundColor: "#eee",
        zIndex: 100000,
        width:110,
        height:36,
        paddingLeft:10
      },
    },
  },
  searchIcon: {
    position: 'fixed',
    margin: '12px',
  },
  closeSearchIcon: {
    fontSize: 14,
  },
  searchBarClose: {
    display: "inline-block",
    position: "absolute",
    top: 15,
    right: 5,
    cursor: "pointer"
  }
})

class SearchBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      inputOpen: false,
      searchOpen: false,
      currentQuery: "",
    }
  }

  openSearchInput = () => {
    this.setState({inputOpen: true});
  }

  closeSearchInput = () => {
    this.setState({inputOpen: false});
  }

  openSearchResults = () => {
    this.setState({searchOpen: true});
  }

  closeSearchResults = () => {
    this.setState({searchOpen: false});
  }

  closeSearch = () => {
    this.setState({searchOpen: false, inputOpen: false});
  }

  handleSearchTap = () => {
    this.setState({inputOpen: true, searchOpen: this.state.currentQuery});
  }

  handleKeyDown = (event) => {
    if (event.key === 'Escape') this.closeSearch();
  }

  queryStateControl = (searchState) => {
    if (searchState.query !== this.state.currentQuery) {
      this.setState({currentQuery: searchState.query});
      if (searchState.query) {
        this.openSearchResults();
      } else {
        this.closeSearchResults();
      }
    }
  }

  render() {
    const algoliaAppId = getSetting('algolia.appId')
    const algoliaSearchKey = getSetting('algolia.searchKey')

    const { classes } = this.props
    const { searchOpen } = this.state

    if(!algoliaAppId) {
      return <div className={classes.root}>Search is disabled (Algolia App ID not configured on server)</div>
    }

    return <div onKeyDown={this.handleKeyDown}>
      <Components.ErrorBoundary>
        <InstantSearch
          indexName="test_posts"
          appId={algoliaAppId}
          apiKey={algoliaSearchKey}
          onSearchStateChange={this.queryStateControl}
        >
          <div className={classNames(classes.searchBar, {"open":this.state.inputOpen})}>
            <div onClick={this.handleSearchTap}>
              <Icon className={classes.searchIcon}>search</Icon>
              <SearchBox resetComponent={<div></div>} focusShortcuts={[]} />
            </div>
            { searchOpen && <div className={classes.searchBarClose} onClick={this.closeSearch}>
              <Icon className={classes.closeSearchIcon}>close</Icon>
            </div>}
          </div>
          { searchOpen && <Components.SearchBarResults />}
        </InstantSearch>
      </Components.ErrorBoundary>
    </div>
  }
}

SearchBar.propTypes = {
  color: PropTypes.string,
};

SearchBar.defaultProps = {
  color: "rgba(0, 0, 0, 0.6)"
}

registerComponent("SearchBar", SearchBar, withStyles(styles));
