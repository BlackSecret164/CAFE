import { Icon } from "@iconify/react";
import { Form, InputGroup } from "react-bootstrap";
import "./Search.scss"; // Đảm bảo bạn import file SCSS

const Search = () => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value); // Xử lý tìm kiếm
  };

  return (
    <div className="search-bar">
      <InputGroup className="input-group">
        <div className="icon-container">
          <Icon
            icon="ic:baseline-search"
            width={24}
            height={24}
            className="icon-custom"
          />
        </div>
        <Form.Control
          type="text"
          placeholder="Search"
          onChange={handleSearchChange}
          className="search-input"
        />
      </InputGroup>
    </div>
  );
};

export default Search;
